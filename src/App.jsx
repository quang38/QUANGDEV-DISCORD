import React, { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [selectedImage, setSelectedImage] = useState(null)
  const [copyStatus, setCopyStatus] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    // Load dark mode preference from localStorage
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Generate clean URLs for UI display
  const getDisplayUrl = (folder, filename) => {
    const baseUrl = window.location.origin
    const encodedFilename = encodeURIComponent(filename)
    // If folder is root, it's in the base IMAGE directory
    if (folder === 'root') {
      return `${baseUrl}/DISCORD/IMAGE/${encodedFilename}`
    }
    // Always use the standard path that matches the public folder structure
    return `${baseUrl}/DISCORD/IMAGE/${folder}/${encodedFilename}`
  }

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Load images from dynamic API
  useEffect(() => {
    const loadImages = async () => {
      try {
        console.log('🔍 Loading images from API...')
        const response = await fetch('/api/images')
        
        if (response.ok) {
          const imageData = await response.json()
          console.log('✅ Images loaded from API:', imageData)
          // Normalize URLs from API
          const normalizedData = imageData.map(img => ({
            ...img,
            url: img.url.startsWith('/') ? img.url : `/${img.url}`
          }))
          setImages(normalizedData)
        } else {
          throw new Error(`API responded with ${response.status}`)
        }
      } catch (error) {
        console.error('❌ Error loading images from API:', error)
        // Fallback to hardcoded list based on ACTUAL disk content
        setImages([
          // { id: 1, name: 'ACG-logo.png', folder: 'ACG', url: '/DISCORD/IMAGE/ACG/ACG-logo.png' },
          // { id: 2, name: 'acg-banner.png', folder: 'ACG', url: '/DISCORD/IMAGE/ACG/acg-banner.png' },
          // { id: 3, name: 'acg-wellcome.png', folder: 'ACG', url: '/DISCORD/IMAGE/ACG/acg-wellcome.png' },
        ])
      } finally {
        setLoading(false)
      }
    }
    
    loadImages()
  }, [])

  const folders = ['all', ...new Set(images.map(img => img.folder))]
  
  const filteredImages = selectedFolder === 'all' 
    ? images 
    : images.filter(img => img.folder.toLowerCase() === selectedFolder.toLowerCase())

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopyStatus(true)
    setTimeout(() => setCopyStatus(false), 2000)
  }

  // Close modal when pressing Escape
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) setSelectedImage(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '2px solid #ebebeb', 
          borderTopColor: '#171717', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#4d4d4d' }}>Đang tải ảnh...</p>
      </div>
    )
  }

  const Modal = () => {
    if (!selectedImage) return null;

    const imageUrl = getDisplayUrl(selectedImage.folder, selectedImage.name);

    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backdropFilter: 'blur(5px)'
        }}
        onClick={() => setSelectedImage(null)}
      >
        <div 
          style={{
            backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
            borderRadius: '16px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            animation: 'modalFadeIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{ 
            padding: '20px 24px', 
            borderBottom: `1px solid ${darkMode ? '#2a2a2a' : '#ebebeb'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? '#ffffff' : '#171717' }}>
                {selectedImage.name}
              </h3>
              <span className="badge" style={{ 
                fontSize: '11px',
                marginTop: '4px',
                backgroundColor: darkMode ? '#2a2a2a' : '#ebf5ff',
                color: darkMode ? '#ffffff' : '#0068d6'
              }}>
                Thư mục: {selectedImage.folder}
              </span>
            </div>
            <button 
              onClick={() => setSelectedImage(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: darkMode ? '#a0a0a0' : '#808080',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Full Image */}
            <div style={{ 
              backgroundColor: darkMode ? '#0a0a0a' : '#fafafa',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px'
            }}>
              <img 
                src={selectedImage.url} 
                alt={selectedImage.name} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '50vh', 
                  objectFit: 'contain',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
            </div>

            {/* Info and Actions */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: '600', 
                color: darkMode ? '#a0a0a0' : '#4d4d4d',
                marginBottom: '8px'
              }}>
                Liên Kết Ảnh:
              </label>
              <div style={{ 
                display: 'flex', 
                gap: '12px',
                backgroundColor: darkMode ? '#0a0a0a' : '#f5f5f5',
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${darkMode ? '#2a2a2a' : '#ebebeb'}`,
                alignItems: 'center'
              }}>
                <code style={{ 
                  flex: 1, 
                  fontSize: '13px', 
                  color: darkMode ? '#4ade80' : '#0068d6',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace'
                }}>
                  {imageUrl}
                </code>
                <button 
                  onClick={() => copyToClipboard(imageUrl)}
                  className={`btn ${copyStatus ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    minWidth: '100px',
                    backgroundColor: copyStatus ? '#10b981' : (darkMode ? '#2a2a2a' : '#ffffff'),
                    color: '#ffffff',
                    border: 'none'
                  }}
                >
                  {copyStatus ? 'Đã Sao Chép!' : 'Sao Chép'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: darkMode ? '#0a0a0a' : '#ffffff' }}>
      <Modal />
      {/* Header */}
      <header style={{ 
        borderBottom: `1px solid ${darkMode ? '#2a2a2a' : '#ebebeb'}`,
        padding: '32px 0',
        position: 'sticky',
        top: 0,
        backgroundColor: darkMode ? '#0a0a0a' : '#ffffff',
        zIndex: 100
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ color: darkMode ? '#ffffff' : '#171717' }}>QUANG.DEV</h1>
              <p style={{ marginTop: '8px', fontSize: '18px', color: darkMode ? '#a0a0a0' : '#4d4d4d' }}>
                Kho Lưu Trữ Ảnh Discord
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="badge" style={{
                backgroundColor: darkMode ? '#2a2a2a' : '#ebf5ff',
                color: darkMode ? '#ffffff' : '#0068d6',
                border: darkMode ? '1px solid #3a3a3a' : 'none'
              }}>
                {images.length} Ảnh
              </span>
              <button 
                className="btn btn-secondary"
                onClick={() => setDarkMode(!darkMode)}
                style={{ 
                  padding: '8px 12px', 
                  fontSize: '14px',
                  minWidth: 'auto',
                  height: 'auto',
                  backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#171717',
                  border: darkMode ? '1px solid #3a3a3a' : 'none',
                  boxShadow: darkMode ? 'none' : 'rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
                }}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '48px 0' }}>
        <div className="container">
          {/* Folder Filter */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ marginBottom: '24px', color: darkMode ? '#ffffff' : '#171717' }}>Bộ Sưu Tập Ảnh</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
              {folders.map(folder => (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`btn ${selectedFolder === folder ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ 
                    textTransform: 'capitalize',
                    backgroundColor: selectedFolder === folder 
                      ? (darkMode ? '#0a72ef' : '#171717')
                      : (darkMode ? '#2a2a2a' : '#ffffff'),
                    color: selectedFolder === folder 
                      ? '#ffffff'
                      : (darkMode ? '#ffffff' : '#171717'),
                    border: selectedFolder === folder 
                      ? 'none'
                      : (darkMode ? '1px solid #3a3a3a' : 'none'),
                    boxShadow: selectedFolder === folder || darkMode 
                      ? 'none'
                      : 'rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
                  }}
                >
                  {folder === 'all' ? 'Tất Cả Ảnh' : folder}
                </button>
              ))}
            </div>
          </div>

          {/* Image Grid */}
          {filteredImages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 0',
              border: `1px solid ${darkMode ? '#2a2a2a' : '#ebebeb'}`,
              borderRadius: '12px'
            }}>
              <h3 style={{ marginBottom: '16px', color: darkMode ? '#ffffff' : '#171717' }}>Không tìm thấy ảnh</h3>
              <p style={{ color: darkMode ? '#a0a0a0' : '#4d4d4d' }}>Thêm một vài ảnh để bắt đầu</p>
            </div>
          ) : (
            <div className="grid grid-cols-3">
              {filteredImages.map(image => (
                <div 
                  key={image.id} 
                  className="image-card" 
                  onClick={() => setSelectedImage(image)}
                  style={{ 
                    backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                    border: `1px solid ${darkMode ? '#2a2a2a' : '#ebebeb'}`,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out'
                  }}
                >
                  <div style={{ aspectRatio: '1', backgroundColor: darkMode ? '#1a1a1a' : '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={image.url}
                      alt={image.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        backgroundColor: darkMode ? '#1a1a1a' : '#fafafa'
                      }}
                      onLoad={() => console.log(`✅ Loaded: ${image.url}`)}
                      onError={(e) => {
                        console.error(`❌ Failed to load image: ${image.url}`);
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                        e.target.nextSibling.innerHTML = `Lỗi: ${image.url.split('/').pop()}`
                      }}
                    />
                    <div style={{ 
                      display: 'none', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%',
                      color: darkMode ? '#666666' : '#808080',
                      fontSize: '14px'
                    }}>
                      Không tìm thấy ảnh
                    </div>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '500', color: darkMode ? '#ffffff' : '#171717' }}>{image.name}</h3>
                      <span className="badge" style={{ 
                        fontSize: '10px',
                        backgroundColor: darkMode ? '#2a2a2a' : '#ebf5ff',
                        color: darkMode ? '#ffffff' : '#0068d6',
                        border: darkMode ? '1px solid #3a3a3a' : 'none'
                      }}>
                        {image.folder}
                      </span>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        fontSize: '10px',
                        color: darkMode ? '#a0a0a0' : '#808080',
                        marginBottom: '4px',
                        fontWeight: '500'
                      }}>
                        Đường Dẫn Ảnh:
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        fontSize: '11px',
                        color: darkMode ? '#a0a0a0' : '#666666',
                        fontFamily: 'monospace',
                        backgroundColor: darkMode ? '#1a1a1a' : '#fafafa',
                        padding: '8px',
                        borderRadius: '4px',
                        wordBreak: 'break-all',
                        alignItems: 'center'
                      }}>
                        <span style={{ flex: 1 }}>{getDisplayUrl(image.folder, image.name)}</span>
                      </div>
                                          </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: `1px solid ${darkMode ? '#2a2a2a' : '#ebebeb'}`,
        padding: '32px 0',
        marginTop: '80px'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: darkMode ? '#a0a0a0' : '#4d4d4d', fontSize: '14px' }}>
              © 2026 QUANG.DEV Kho Lưu Trữ Ảnh Discord
            </p>
            <p style={{ color: darkMode ? '#808080' : '#808080', fontSize: '12px', marginTop: '8px' }}>
              Phục vụ ảnh cho Discord bot của bạn với phong cách
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .image-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  )
}

export default App
