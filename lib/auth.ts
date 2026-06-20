import { cookies } from 'next/headers'
import crypto from 'crypto'

const COOKIE = 'assoc_admin'
export function sign(value:string){
  const secret = process.env.SESSION_SECRET || 'dev-secret'
  const sig = crypto.createHmac('sha256', secret).update(value).digest('hex')
  return `${value}.${sig}`
}
export function verify(token?:string){
  if(!token) return false
  const [value, sig] = token.split('.')
  if(!value || !sig) return false
  return sign(value) === token
}
export async function isAdmin(){
  const token = (await cookies()).get(COOKIE)?.value
  return verify(token)
}
export async function setAdminCookie(){
  ;(await cookies()).set(COOKIE, sign('admin'), { httpOnly:true, sameSite:'lax', secure:true, path:'/', maxAge:60*60*8 })
}
export async function clearAdminCookie(){
  ;(await cookies()).delete(COOKIE)
}
