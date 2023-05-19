import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import {z} from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
//listagem de memórias
    app.get('/memories', async () => {
        const memories = await prisma.memory.findMany({
            orderBy: {
                createdAt: 'asc'
            }
        })
        return memories.map((memory)=> {
            return {
                id: memory.id,
                coverUrl: memory.coverUrl,
                excerpt: memory.content.substring(0, 115).concat('...')
            }
        })
    })
// listagem de uma memória específica
    app.get('/memories/:id', async (request) => {
        const paramsSchema = z.object({
            id: z.string().uuid()
        }) 
        const { id } = paramsSchema.parse(request.params)
        const memory = await prisma.memory.findUniqueOrThrow({
            where: {
                id,
            },
        })
        return memory
    })

// criação de memória 
    app.post('/memories', async (request) => {
        const bodySchema = z.object({
            content:z.string(),
            isPublic: z.coerce.boolean().default(false),
            coverUrl: z.string()
        }) 

        const {content, isPublic, coverUrl} = bodySchema.parse(request.body)

        const memory = await prisma.memory.create({
            data: {
                content,
                isPublic,
                coverUrl,
                userId: '0fd2b444-0e72-4dd8-bb04-901c7370f22c',
            }
        })
        return memory
    })

// atualização de memória 
    app.put('/memories/:id', async (request) => {
        const paramsSchema = z.object({
            id: z.string().uuid()
        }) 
        const { id } = paramsSchema.parse(request.params)

        const bodySchema = z.object({
            content:z.string(),
            isPublic: z.coerce.boolean().default(false),
            coverUrl: z.string()
        }) 

        const {content, isPublic, coverUrl} = bodySchema.parse(request.body)
        const memoryUpdated = await prisma.memory.update({
            where: {
                id,
            },
            data: {
                content,
                isPublic,
                coverUrl,
            },
        })
        return memoryUpdated
    })

// remoção de memória 
    app.delete('/memories/:id', async (request) => {
        const paramsSchema = z.object({
            id: z.string().uuid()
        }) 
        const { id } = paramsSchema.parse(request.params)
         await prisma.memory.delete({
            where: {
                id,
            },
        })
    })
}