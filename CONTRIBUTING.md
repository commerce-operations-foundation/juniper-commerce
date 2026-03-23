# Contributing to Juniper Commerce

Thank you for your interest in contributing to the onX reference implementation.

## Getting Started

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy environment config: `cp .env.example .env.local`
4. Start dev server: `npm run dev`
5. Visit `http://localhost:3000`

## Development Workflow

1. Create a branch from `main` for your change
2. Make your changes with clear, focused commits
3. Run the build to verify: `npm run build`
4. Open a pull request with a description of what and why

## Pull Request Guidelines

- **One concern per PR.** Bug fix, feature, or refactor — not all three.
- **Describe the change.** What does it do? Why is it needed?
- **Include test steps.** How can a reviewer verify the change works?
- **No secrets.** Never commit API keys, credentials, or `.env` files.

## Architecture

Juniper is built on two abstraction layers that make it extensible:

### Adding a Data Provider

Implement the `DataProvider` interface in `src/lib/data/provider.ts`:

```typescript
export class MyProvider implements DataProvider {
  async getProducts(filter?: ProductFilter): Promise<PaginatedResult<Product>> { ... }
  async getOrderById(id: string): Promise<Order | null> { ... }
  // ... all DataProvider methods
}
```

Register it in `src/lib/onx-client.ts` under the `getProvider()` switch statement.

### Adding an LLM Provider

Implement the `LLMProvider` interface in `src/lib/ai/llm-provider.ts`:

```typescript
export class MyLLMProvider implements LLMProvider {
  name = 'My Provider';
  async chat(messages, tools, systemPrompt, executeToolCall) { ... }
}
```

Register it in `src/lib/ai/llm-provider.ts` detection logic.

## Code Standards

- TypeScript throughout — no `any` unless unavoidable
- Tailwind CSS for styling
- ESLint for linting: `npm run lint`
- Meaningful variable and function names over comments

## Reporting Issues

Open a GitHub issue with:
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node version, browser)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
