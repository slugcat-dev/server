import { Router } from 'express'
import { auth } from './middleware/auth'
import { validateURLParam } from './middleware/validateURLParam'
import { getIndex } from './routes/index'
import { postSendOTP } from './routes/auth/send-otp'
import { postVerifyOTP } from './routes/auth/verify-otp'
import { getBoards, getMe, getUploads } from './routes/users'
import { getBoard, postSync } from './routes/boards'
import { getImageLqip } from './routes/image-lqip'
import { getLinkData } from './routes/link-data'
import { getLinkType } from './routes/link-type'
import { getProxy } from './routes/proxy'
import { postUpload } from './routes/upload'
import config from './config'
import express from 'express'

export const router = Router()

router.get('/', getIndex)
router.post('/auth/send-otp', postSendOTP)
router.post('/auth/verify-otp', postVerifyOTP)
router.get('/user/me', auth, getMe)
router.get('/user/me/boards', auth, getBoards)
router.get('/user/me/uploads', auth, getUploads)
router.get('/board/:id', auth, getBoard)
router.post('/sync', auth, postSync)
router.get('/image-lqip', validateURLParam, getImageLqip)
router.get('/link-data', validateURLParam, getLinkData)
router.get('/link-type', validateURLParam, getLinkType)
router.get('/proxy', validateURLParam, getProxy)
router.post('/upload', auth, postUpload)
router.use('/uploads', express.static(config.uploadDir))
