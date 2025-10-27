# Contributing to Confidential Payroll System

Thank you for considering contributing to Confidential Payroll System! 🎉

## Code of Conduct

Please be respectful and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When you create a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment** (OS, browser, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code follows the existing style
5. Write a clear commit message

## Development Process

### Setting Up Development Environment

```bash
# Clone your fork
git clone https://github.com/yourusername/confidential-payroll.git

# Install dependencies
npm install
cd frontend && npm install

# Create a feature branch
git checkout -b feature/my-new-feature
```

### Coding Style

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript/React**: Use ESLint and Prettier
- **Comments**: Write clear comments for complex logic
- **Naming**: Use descriptive variable and function names

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally

Example:
```
Add employee bulk upload feature

- Implement CSV parser
- Add validation for employee data
- Update UI with file upload component

Closes #123
```

### Testing

Before submitting a PR:
```bash
# Run contract tests
npx hardhat test

# Compile contracts
npx hardhat compile

# Test frontend
cd frontend && npm run dev
```

## Project Structure

```
confidential-payroll/
├── contracts/          # Smart contracts
├── scripts/            # Deployment scripts
├── frontend/           # React application
├── test/               # Contract tests
└── docs/               # Documentation
```

## Questions?

Feel free to open an issue with the `question` label.

---

Thank you for your contributions! 🙌

