import './globals.css'
import GlobalLoading from '@/components/GlobalLoading'

export const metadata = { title: 'Sampada Residency Financials', description: 'Apartment association financial dashboard' }

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body><GlobalLoading/>{children}</body></html>
}
