import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import type React from "react"
import { Suspense } from 'react'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <Navbar />
            <main>
                <Suspense>
                    {children}
                </Suspense>
            </main>
            <Footer />
        </div>
    )
}

