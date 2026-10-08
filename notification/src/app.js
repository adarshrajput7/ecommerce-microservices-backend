import express from 'express'
// const { connect } = require("./broker/broker.js")
import connect from './broker/broker.js'
import listener from './broker/listners.js'

const app = express()

connect.connect().then(() => {
    listener()
})

app.get('/', (req, res) => {
    res.status(200).json({
        message:'Notification Service is running.'
    })
})



export default  app