# @queaxtra/zvelte

Zvelte is a command-line interface (CLI) tool designed to streamline the creation of new SvelteKit projects. It provides a rapid way to scaffold projects by cloning a pre-configured, production-ready template that integrates Shadcn UI, Tailwind CSS, and i18n (internationalization) support, offering a robust and modern foundation for web application development.

## Updates

Zvelte has been updated with new features to improve your project setup experience:

- **Create in Current Directory**: You can now initialize a project in your current working directory by using `.` as the project directory. This is useful for setting up a project in an existing folder.

  ```bash
  bunx @queaxtra/zvelte create .
  ```

- **Automatic Dependency Installation**: The `--install` flag allows you to automatically install project dependencies after creation. You can specify a package manager (`bun`, `pnpm`, `npm`, or `yarn`).

  ```bash
  # Install with bun
  bunx @queaxtra/zvelte create my-project --install=bun

  # Or let Zvelte prompt you to choose an installed package manager
  bunx @queaxtra/zvelte create my-project --install
  ```

- **Help Command**: For a quick overview of commands and options, use the `-h` or `--help` flag.

  ```bash
  bunx @queaxtra/zvelte --help
  ```

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
