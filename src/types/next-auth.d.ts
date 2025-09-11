import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      userType: string
      companyId?: string
      companyGroupId?: string
      company?: {
        id: string
        name: string
      }
      companyGroup?: {
        id: string
        name: string
      }
    }
  }

  interface User {
    id: string
    email: string
    name: string
    image?: string
    userType: string
    companyId?: string
    companyGroupId?: string
    company?: {
      id: string
      name: string
    }
    companyGroup?: {
      id: string
      name: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userType?: string
    companyId?: string
    companyGroupId?: string
    company?: {
      id: string
      name: string
    }
    companyGroup?: {
      id: string
      name: string
    }
  }
}