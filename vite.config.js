import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'images-api',
      configureServer(server) {
        // Case-insensitive URL middleware for discord/image paths
        server.middlewares.use((req, res, next) => {
          const url = req.url
          
          // Handle all case combinations: any case of discord + any case of image
          const urlParts = url.split('/')
          if (urlParts.length >= 3 && 
              urlParts[1].toLowerCase() === 'discord' && 
              urlParts[2].toLowerCase() === 'image') {
            // Convert to standard DISCORD/IMAGE path
            const newPath = '/DISCORD/IMAGE/' + urlParts.slice(3).join('/')
            req.url = newPath
          }
          
          next()
        })

        server.middlewares.use('/api/images', (req, res, next) => {
          try {
            const imagePath = path.join(process.cwd(), 'public', 'DISCORD', 'IMAGE')
            const images = []
            let id = 1

            // Scan root directory
            if (fs.existsSync(imagePath)) {
              const files = fs.readdirSync(imagePath)
              files.forEach(file => {
                const filePath = path.join(imagePath, file)
                const stat = fs.statSync(filePath)
                
                if (stat.isFile() && /\.(png|jpg|jpeg|gif|webp)$/i.test(file)) {
                  images.push({
                    id: id++,
                    name: file,
                    folder: 'root',
                    url: `/DISCORD/IMAGE/${encodeURIComponent(file)}`
                  })
                }
              })

              // Scan subdirectories
              const dirs = files.filter(file => {
                const filePath = path.join(imagePath, file)
                return fs.statSync(filePath).isDirectory()
              })

              dirs.forEach(dir => {
                const dirPath = path.join(imagePath, dir)
                const dirFiles = fs.readdirSync(dirPath)
                dirFiles.forEach(file => {
                  const filePath = path.join(dirPath, file)
                  if (fs.statSync(filePath).isFile() && /\.(png|jpg|jpeg|gif|webp)$/i.test(file)) {
                    images.push({
                      id: id++,
                      name: file,
                      folder: dir,
                      url: `/DISCORD/IMAGE/${dir}/${encodeURIComponent(file)}`
                    })                  }
                })
              })
            }

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(images))
          } catch (error) {
            console.error('Error scanning images:', error)
            res.status(500).json({ error: 'Failed to scan images' })
          }
        })
      }
    }
  ],
  server: {
    port: 3001,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  publicDir: 'public'
})
