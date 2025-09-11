import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            company: true,
            companyGroup: true
          }
        })

        if (!user || !user.active) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Retornar dados do usuário (SEM incluir a senha!)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image || user.photo || undefined,
          userType: user.userType,
          companyId: user.companyId || undefined,
          companyGroupId: user.companyGroupId || undefined,
          company: user.company ? {
            id: user.company.id,
            name: user.company.name
          } : undefined,
          companyGroup: user.companyGroup ? {
            id: user.companyGroup.id,
            name: user.companyGroup.name
          } : undefined
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType
        token.companyId = user.companyId
        token.companyGroupId = user.companyGroupId
        token.company = user.company
        token.companyGroup = user.companyGroup
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.userType = token.userType as string
        session.user.companyId = token.companyId as string
        session.user.companyGroupId = token.companyGroupId as string
        session.user.company = token.company as any
        session.user.companyGroup = token.companyGroup as any
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // NUNCA deixar true em produção
}