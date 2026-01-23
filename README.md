# Betaflight Support Explorer

A web-based tool for analyzing Betaflight firmware support data and build information from Support IDs.

## Features

- **Build Information**: View firmware details, configuration, and build status
- **Hardware Configuration**: Analyze onboard hardware configuration
- **Pilot Configuration**: Access flight modes and UART port assignments
- **DMA & Timer Analysis**: Identify resource conflicts and timer configurations
- **CLI Backup**: Copy the entire flight controller configuration at the time of data submission
- **History Tracking**: Keep track of previously analyzed Support IDs

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vitroidfpv/betaflight-support-explorer.git
   cd betaflight-support-explorer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Running in Docker

1. Clone the repository:

   ```bash
   git clone https://github.com/vitroidfpv/betaflight-support-explorer.git
   cd betaflight-support-explorer
   ```

2. Create a `.env` file based on the `.env.example`:

   ```bash
   cp .env.example .env
   ```

   And set your `GITHUB_PAT` in the `.env` file. Create one in the [GitHub Personal Access Tokens settings](https://github.com/settings/tokens)

3. Build and run the Docker container:

   ```bash
   docker build -t betaflight-support-explorer .
   docker run -d -p 3000:3000 --env-file .env betaflight-support-explorer
   ```

   or using Docker Compose:

   ```bash
   docker compose up -d --build
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Get Support ID**: Generate a Support ID in Betaflight Configurator in the CLI tab
2. **Paste ID**: Use the search bar to paste or type the Support ID (UUID format)
3. **Analyze Data**: Browse through organized sections showing:
   - Build configuration and firmware details
   - Status information and detected problems
   - Serial port configurations and flight modes
   - Hardware resource allocation and conflicts
4. **Settings**: Customize which data sections to display in `/settings`

## Technical Details

- Built with [SvelteKit](https://kit.svelte.dev/) and TypeScript
- UI components from [Skeleton Labs](https://www.skeleton.dev/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Data fetched from [Betaflight Build API](https://build.betaflight.com/)

## Requirements

- Betaflight firmware 4.4.0 or later
- Modern web browser with JavaScript enabled
- Internet connection for API access

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
