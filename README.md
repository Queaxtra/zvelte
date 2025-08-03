# @queaxtra/zvelte

Zvelte is a command-line interface (CLI) tool designed to streamline the creation of new SvelteKit projects. It provides a rapid way to scaffold projects by cloning a pre-configured, production-ready template that integrates Shadcn UI, Tailwind CSS, and i18n (internationalization) support, offering a robust and modern foundation for web application development.

## Installation

To use Zvelte, you don't need to install it globally. You can directly use `bunx` to run the CLI tool.

## Usage

To create a new SvelteKit project using Zvelte, open your terminal and run the following command:

```bash
bunx @queaxtra/zvelte create <project-directory>
```

Replace `<project-directory>` with the desired name for your new project.

**Example:**

```bash
bunx @queaxtra/zvelte create my-svelte-app
```

This command will:
1.  Clone the [sveltekit-shadcn-template](https://github.com/Queaxtra/sveltekit-shadcn-template) repository into the specified directory.
2.  Set up your new SvelteKit project with all the pre-configured features.

After the project is created, navigate into your new project directory and install the dependencies:

```bash
cd my-svelte-app
bun install # npm install, yarn install, pnpm install
```

Then, you can start the development server:

```bash
bun run dev # npm run dev, yarn dev, pnpm dev
```

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request on the [GitHub repository](https://github.com/Queaxtra/zvelte).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
