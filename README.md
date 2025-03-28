<div align="center">
    <a href="https://manzoni.app" target="_blank"><img alt="Manzoni Logo" src="https://avatars.githubusercontent.com/u/204217907" width="60px" style="border-radius: 12px;" /></a>
    <h1>Manzoni</h1>
    <p>Write using large language models (LLMs) privately on your laptop</p>
    <p>No API calls or GPUs required. <a href="https://manzoni.app" target="_blank">Download the app</a> and get started.</p>
    <div>
        <a href="https://discord.gg/CXVgKFv5" target="_blank">Discord</a> • <a href="https://sibforms.com/serve/MUIFAOFBJzHRATSzv9THHuRI3eXZOT9WhpqQIdmFb5PiMfgXjcDOD7ccKMVhZKTILmCj3gt3SHubSTPbJrrdApbTtxtsehI1RfgeNhJfz2-Ro4wukvZS_zCzYALbtxvhdCMdBF3kZQU3Zwj58hZBYbyDam1F_9wuikAGHqqia-6UEnLt8LEXCNWx-Isk9720zsJTi5lUMyL0JaVA" target="_blank">Subscribe to the newsletter</a>
    </div>
</div>

## Features
- 📦 Run [open source LLMs](https://manzoni.app/models/) locally on your machine.
- 📝 Choose from a [library of prompts](https://manzoni.app/templates/) to kickstart your writing—no blank page struggle.
- 🖋 Select text and ask AI to edit it instantly.
- ✨ Press 'space' to open an AI prompt bar and ask anything.

## Prerequisites

- Node.js (v20 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/gems-platforms/manzoni-app.git
cd manzoni-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run start
```

## Build

To create a production build:

```bash
npm run package:macos
```

The built application will be available in the `release` directory.

## Development

The project uses:
- [Vite](https://vitejs.dev/) for fast development
- [Electron](https://www.electronjs.org/) for cross-platform desktop application functionality
- [React](https://reactjs.org/) for the user interface
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [ESLint](https://eslint.org/) for code quality

## Contributing

Contributions are welcomed! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) and follow the bug reports, documentation issue, and feature request markdown templates.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [tiptap](https://tiptap.dev/)
- [node-llama-cpp](https://node-llama-cpp.withcat.ai/)
- [Hugging Face](https://huggingface.co)

## Citation
If you utilize this repository, models or data in a downstream project, please consider citing it with:

```
@misc{manzoni,
  author = {Lorenzo Bernaschina},
  title = {Manzoni: text editor running local LLMs},
  year = {2025},
  publisher = {GitHub},
  journal = {GitHub repository},
  howpublished = {\url{https://github.com/gems-platforms/manzoni-app}},
}
```
