import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'subagents.sh - Discover and install Claude Code subagents'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Pre-generated ANSI Shadow ASCII art for "SUBAGENTS"
const asciiArt = `███████╗██╗   ██╗██████╗  █████╗  ██████╗ ███████╗███╗   ██╗████████╗███████╗
██╔════╝██║   ██║██╔══██╗██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔════╝
███████╗██║   ██║██████╔╝███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ███████╗
╚════██║██║   ██║██╔══██╗██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║
███████║╚██████╔╝██████╔╝██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ███████║
╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝`

export default async function Image() {
  // Load JetBrains Mono font from local file
  const fontData = await readFile(
    join(process.cwd(), 'assets/fonts/JetBrainsMono-Regular.ttf')
  )

  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Radial glow effect */}
        <div
          style={{
            position: 'absolute',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse at center, rgba(20, 184, 166, 0.15) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* ASCII art */}
        <pre
          style={{
            fontFamily: 'JetBrains Mono',
            fontSize: '18px',
            lineHeight: '1.1',
            color: '#14b8a6',
            textAlign: 'center',
            whiteSpace: 'pre',
            margin: 0,
            textShadow: '0 0 20px rgba(20, 184, 166, 0.5)',
          }}
        >
          {asciiArt}
        </pre>

        {/* Tagline */}
        <p
          style={{
            fontFamily: 'JetBrains Mono',
            fontSize: '24px',
            color: '#888888',
            marginTop: '40px',
            letterSpacing: '0.05em',
          }}
        >
          Discover and install Claude Code subagents
        </p>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'JetBrains Mono',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}
