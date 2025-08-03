// import express, { json } from 'express';
// const app = express();
// import { body, validationResult } from 'express-validator';
// import { gameCardSchema, genreSchema } from '../constants/gameFormSchema.js';
// import { addRowToTable, addToTable, deleteFromTable, selectFromTable } from '../db/queries.js';
// import pool from '../db/pool.js';
// import { tableMap } from '../db/tableMap.js';
// import { updateInTable } from '../db/queries.js';
// import { commentFormSchema } from '../constants/commentFormSchema.js';
import { fileSchema } from '../constants/drive/fileSchema.js';
import { prisma } from '../db/prismaClient.js';
import { logJSONStringify } from '../js/utils.js';
import { v2 as cloudinary } from 'cloudinary';

// app.use(express.urlencoded({ extended: true }));

//RENDER DRIVE MAIN PAGE
export const renderMainGet = async (req, res) => {
    try {
        const filesRaw = await prisma.file.findMany({
            // where: { field: value },
            // orderBy: { field: 'asc' },
            // skip: 0,
            // take: 10
        });
        console.log('🚀 ~ filesRaw:', filesRaw);

        const filesFormatted = filesRaw.map((file) => {
            return Object.fromEntries(
                Object.entries(file).map(([key, value]) => [
                    key,
                    {
                        value,
                        label: fileSchema[key]?.label || '',
                        type: fileSchema[key]?.type || '',
                        visible: fileSchema[key]?.visible ?? true, //возвращает true, если левый операнд null или undefined
                        size: Number(file.size) //конвертация из Big Int
                    },
                ])
            );
        });
        // console.log('🚀 ~ filesFormatted:', filesFormatted);

        const foldersRaw = await prisma.folder.findMany({
            include: { files: true }
        });
        // console.log("🚀 ~ foldersRaw:", foldersRaw);

        const foldersFormatted = foldersRaw.map(f => {
            return {
                ...f,
                fileCount: f.files.length > 0 ? f.files.length : null
            }
        })
        // console.log("🚀 ~ foldersFormatted:", foldersFormatted);

        res.render('drive/drive-main', {
            files: filesFormatted,
            folders: foldersFormatted,
        });
    } catch (error) {
        warn(error);
    }
};

//RENDER FOLDER
export const renderFolderGet = async (req, res) => {
    try {
        log('Я В ПАПКЕ')
        const folderFilesRaw = await prisma.file.findMany({
            where: { folderId: +req.params.folderId}
        });
        console.log("🚀 ~ folderFilesRaw:", folderFilesRaw);

        const filesMappedToSchema = folderFilesRaw.map((file) => {
            return Object.fromEntries(
                Object.entries(file).map(([key, value]) => [
                    key,
                    {
                        value,
                        label: fileSchema[key]?.label || '',
                        type: fileSchema[key]?.type || '',
                        visible: fileSchema[key]?.visible ?? true, //возвращает true, если левый операнд null или undefined
                    },
                ])
            );
        });
        // console.log('🚀 ~ filesMappedToSchema:', filesMappedToSchema);

        res.render('drive/folder', {
            files: filesMappedToSchema,
            folderId: +req.params.folderId

        });
    } catch (error) {
        warn(error);
    }
}

//UPLOAD FILE
export const uploadFileGet = async (req, res) => {
    try {
        const folderId = +req.params.folderId || null;
        // console.log("🚀 ~ folderId:", folderId);
        
        res.render('drive/upload-file', {
            endpoint: folderId ? `/drive/folder/${folderId}/upload-file` : `/drive/upload-file`
        });
    } catch (error) {
        warn(error);
    }
};

export const uploadFilePost = async (req, res) => {
    try {
        // logJSONStringify("req.body", req.body);
        // log(req.files);

        log(req.files['files']);

        const uploadedFile = await cloudinary.uploader.upload(req.files['files'][0].path, {
            resource_type: 'raw',
            use_filename: true,
            unique_filename: false,
        });
        console.log("🚀 ~ uploadedFile:", uploadedFile);

        const fileAddedToDb = await prisma.file.create({
            data: {
                name: req.files['files'][0].originalname,
                // size: (req.files['files'][0].size / 1000000).toFixed(1) + ' МБ',
                size: req.files['files'][0].size,
                link: uploadedFile.secure_url,
                //условное добавление - если req.params.folderId существует (загрузка НЕ из корневой папки)
                ...(req.params.folderId && {
                folder: {
                    connect: {
                        id: Number(req.params.folderId)
                    }
                }})
            },
        });
        console.log("🚀 ~ fileAddedToDb:", fileAddedToDb)

        res.redirect('/drive');
    } catch (error) {
        warn(error);
    }
};

//TODO: переделать на memory storage
// валидация загруженных файлов
//загрузка нескольких файлов

//result

/*
Original file:

{
    fieldname: 'files',
    originalname: 'log (7).txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    destination: 'uploads/',
    filename: 'dcc427826817ebee917b1540b28dc8d5',    
    path: 'uploads\\dcc427826817ebee917b1540b28dc8d5',
    size: 124804
  }

🚀 ~ uploadedFile: {
  asset_id: '2d173ec4668e9d481df10d6543d831ca',      
  public_id: 'dcc427826817ebee917b1540b28dc8d5',     
  version: 1754152555,
  version_id: '9ea895e3cd80ee683f3d4bacc65157c6',    
  signature: 'daae19a77c4c833ffcc064b8ef1c15b256e3472f',
  resource_type: 'raw',
  created_at: '2025-08-02T16:35:55Z',
  tags: [],
  bytes: 124804,
  type: 'upload',
  etag: '5e0473fe45a4a174a330ae8876b48ea6',
  placeholder: false,
  url: 'http://res.cloudinary.com/dftol96y5/raw/upload/v1754152555/dcc427826817ebee917b1540b28dc8d5',     
  secure_url: 'https://res.cloudinary.com/dftol96y5/raw/upload/v1754152555/dcc427826817ebee917b1540b28dc8d5',
  asset_folder: '',
  display_name: 'dcc427826817ebee917b1540b28dc8d5',  
  original_filename: 'dcc427826817ebee917b1540b28dc8d5',
  api_key: '512251146511688'
}
*/
