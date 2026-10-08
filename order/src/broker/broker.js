import amqplib from 'amqplib'

let channel = null
let connection = null

let reconnectTimer = null
let reconnectDelay = 1000

const consumers = new Map()


// RabbitMQ se connect
const connect = async () => {
    if (connection && channel) {
        return connection
    }

    try {
        connection = await amqplib.connect(process.env.RABBIT_URL)

        console.log('Connected to RabbitMQ')

        channel = await connection.createChannel()

        // Reconnect delay reset
        reconnectDelay = 1000

        // Connection error handle
        connection.on('error', (error) => {
            console.error(
                'RabbitMQ error:',
                error.message
            )
        })

        // Connection close hone par auto reconnect
        connection.on('close', () => {
            console.log(
                'RabbitMQ disconnected. Reconnecting...'
            )

            connection = null
            channel = null

            reconnect()
        })

        // Channel error handle
        channel.on('error', (error) => {
            console.error(
                'RabbitMQ channel error:',
                error.message
            )
        })

        // Existing consumers ko reconnect ke baad restore karo
        for (const [queueName, callback] of consumers) {
            await createConsumer(queueName, callback)
        }

        return connection

    } catch (error) {
        console.error(
            'RabbitMQ connection failed:',
            error.message
        )

        connection = null
        channel = null

        reconnect()
    }
}


// Auto reconnect
const reconnect = () => {
    if (reconnectTimer) return

    reconnectTimer = setTimeout(async () => {
        reconnectTimer = null

        await connect()

        reconnectDelay = Math.min(
            reconnectDelay * 2,
            30000
        )

    }, reconnectDelay)

    console.log(
        `RabbitMQ retry in ${reconnectDelay / 1000}s`
    )
}


// Consumer create
const createConsumer = async (queueName, callback) => {
    if (!channel) return

    await channel.assertQueue(queueName, {
        durable: true
    })

    await channel.consume(queueName, async (msg) => {
        if (!msg) return

        try {
            const data = JSON.parse(
                msg.content.toString()
            )

            await callback(data)

            channel.ack(msg)

        } catch (error) {
            console.error(
                'Message processing error:',
                error.message
            )

            channel.nack(msg, false, false)
        }
    })
}


// Publish message
const publishToQueue = async (
    queueName,
    data = {}
) => {
    if (!channel || !connection) {
        await connect()
    }

    if (!channel) {
        throw new Error(
            'RabbitMQ channel unavailable'
        )
    }

    await channel.assertQueue(queueName, {
        durable: true
    })

    channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(data)),
        {
            persistent: true
        }
    )

    console.log(
        'Message sent to queue',
        queueName,
        data
    )
}


// Subscribe
const subscribeToQueue = async (
    queueName,
    callback
) => {
    // Consumer save kar lo
    // reconnect ke baad automatically restore hoga
    consumers.set(queueName, callback)

    if (!channel || !connection) {
        await connect()
    }

    await createConsumer(
        queueName,
        callback
    )
}


// Graceful shutdown
const disconnect = async () => {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
    }

    try {
        if (channel) {
            await channel.close()
        }

        if (connection) {
            await connection.close()
        }

    } catch (error) {
        console.error(
            'RabbitMQ disconnect error:',
            error.message
        )
    }

    channel = null
    connection = null
}


// Server stop/restart par properly disconnect
process.on('SIGINT', disconnect)
process.on('SIGTERM', disconnect)


export default {
    connect,
    publishToQueue,
    subscribeToQueue,
    disconnect
}
