# 🎨 Lumina AI - Image Generator

> Create stunning visual masterpieces with **Real AI** powered by MiniMax-H3.

## ✨ Features

### 🤖 Real AI Image Generation
- **MiniMax-H3 Model** - High quality AI-generated images
- **Free API Access** - Get your free API token from Hugging Face
- **Fallback Mode** - Works without API for procedural generation

### Core Features
- **🎯 Text-to-Image Generator** - Transform imagination into art
- **🎨 6 Styles** - Photo, Digital, Concept, Anime, 3D, Painting
- **📐 Aspect Ratios** - 1:1, 16:9, 9:16, 4:3, 3:4
- **⚡ Quality Slider** - Speed vs quality control
- **📜 History** - Track all generations
- **⬇️ Download** - Export as PNG

## 🔧 Setup AI Generation

### Get Your Free Hugging Face Token

1. Go to [Hugging Face](https://huggingface.co/join)
2. Create a free account
3. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Create a new token with "Read" permissions
5. Copy the token (starts with `hf_`)

### Configure the App

1. Click the ⚙️ Settings button in the header
2. Paste your Hugging Face token
3. Check "Use Real AI Generation"
4. Click "Save Settings"

Now your images will be generated using real AI!

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/antono4/firefly.git
cd firefly

# Start a local server
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

## 🎯 Usage

1. **Enter a Prompt** - Describe what you want to create
2. **Choose a Style** - Photo, Digital Art, Concept, Anime, 3D, or Paint
3. **Set Aspect Ratio** - 1:1, 16:9, 9:16, 4:3, or 3:4
4. **Click Generate** - Watch your imagination come to life!

## 📁 Project Structure

```
firefly/
├── index.html    # Main HTML
├── styles.css    # CSS styling
├── app.js        # Application logic
├── README.md     # This file
└── LICENSE       # MIT License
```

## 🤝 Contributing

Contributions are welcome!

## 📄 License

MIT License - See [LICENSE](LICENSE)
