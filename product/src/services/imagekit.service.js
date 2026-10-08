import ImageKit, { toFile } from '@imagekit/nodejs';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const uploadImage = async ({
    buffer,
    originalname,
    folder = '/Product-Images'
}) => {
    if (!buffer || !buffer.length) {
        throw new Error('Image buffer is missing');
    }

    const extension = originalname?.split('.').pop() || 'jpg';

    const fileName = `${uuidv4()}.${extension}`;

    const file = await toFile(buffer, fileName);

    const res = await imagekit.files.upload({
        file,
        fileName,
        folder,
    });

    return {
        url: res.url,
        thumbnail: res.thumbnailUrl || res.url,
        id: res.fileId,
    };
};

export { imagekit, uploadImage };
