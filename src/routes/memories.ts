import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import {z} from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
    app.addHook('preHandler', async (request) => {
        await request.jwtVerify()
    })
    //listagem de memórias
    app.get('/memories', async (request) => {
        const memories = await prisma.memory.findMany({
            where: {
                userId: request.user.sub
            },
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
    app.get('/memories/:id', async (request, reply) => {
        const paramsSchema = z.object({
            id: z.string().uuid()
        }) 
        const { id } = paramsSchema.parse(request.params)
        const memory = await prisma.memory.findUniqueOrThrow({
            where: {
                id,
            },
        })

        if(!memory.isPublic && memory.userId !== request.user.sub) {
            reply.status(403).send({
                error: 'Forbidden'
            })
        }

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
                userId: request.user.sub,
            }
        })
        return memory
    })

    // atualização de memória 
    app.put('/memories/:id', async (request, reply) => {
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

        let memory = await prisma.memory.findUniqueOrThrow({
            where: {
                id,
            },
        })

        if(memory.userId !== request.user.sub) {
            return reply.status(401).send()
        }

       memory = await prisma.memory.update({
            where: {
                id,
            },
            data: {
                content,
                isPublic,
                coverUrl,
            },
        })
        return memory
    })

    // remoção de memória 
    app.delete('/memories/:id', async (request, reply) => {
        const paramsSchema = z.object({
            id: z.string().uuid()
        }) 
        const { id } = paramsSchema.parse(request.params)

        const memory = await prisma.memory.findUniqueOrThrow({
            where: {
                id,
            },
        })

        if(memory.userId !== request.user.sub) {
            return reply.status(401).send()
        }
         await prisma.memory.delete({
            where: {
                id,
            },
        })
    })
}