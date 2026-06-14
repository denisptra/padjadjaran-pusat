import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Public } from '../../core/decorators/public.decorator';

@ApiTags('files')
@Controller('files')
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
          console.warn(`File upload rejected: Unsupported format for file '${file.originalname}' with mime type '${file.mimetype}'`);
          return cb(
            new Error(
              'Format file tidak didukung! (Hanya JPG, PNG, WEBP, PDF)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required or format is not supported.');
    }
    return {
      filename: file.filename,
      url: `/files/${file.filename}`,
      storagePath: `/files/${file.filename}`, // Add this for frontend compatibility
    };
  }

  @Post('upload-secure')
  @ApiOperation({ summary: 'Upload a secure file (with 10MB limit)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
          console.warn(`File upload rejected: Unsupported format for file '${file.originalname}' with mime type '${file.mimetype}'`);
          return cb(
            new Error(
              'Format file tidak didukung! (Hanya JPG, PNG, WEBP, PDF)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadSecureFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required or format is not supported.');
    }
    return {
      filename: file.filename,
      url: `/files/${file.filename}`,
      storagePath: `/files/${file.filename}`,
    };
  }

  @Get(':filename')
  @Public()
  @ApiOperation({ summary: 'Get a file' })
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const path = this.filesService.getFilePath(filename);
    return res.sendFile(path);
  }
}
