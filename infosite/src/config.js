import path from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

//CONSTANTS
export const PORT = 8888;

//составляем путь к папке со статичными файлами по формуле - папка текущего js.файла (src) + public
export const STATIC_FOLDER_PATH = path.join(__dirname, 'public');
export const PAGE404_FILE = path.join(STATIC_FOLDER_PATH, "404.html");