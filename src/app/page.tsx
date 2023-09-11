import Image from 'next/image'
import Hello from './hello.mdx'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Hello className="text-9xl" />
    </main>
  )
}
