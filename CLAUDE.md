## Naming Conventions

- Component props interfaces MUST be named using the pattern `I<ComponentName>Props`.
- The interface name must start with the prefix `I`, followed by the exact component name in PascalCase, followed by the suffix `Props`.
- Always use `interface` (not `type`) for component props.
- Place the interface definition directly above the component, in the same file (unless explicitly shared).

### Examples
- Component `Button` → `IButtonProps`
- Component `UserCard` → `IUserCardProps`
- Component `LoginForm` → `ILoginFormProps`

## Import Conventions

- ALWAYS use absolute imports with the `app/*` alias instead of relative parent imports (`../`).
- NEVER use `../` to traverse up directories. Same-folder imports with `./` are allowed.
- This keeps import paths stable when files are moved and improves readability.

### Correct
\`\`\`tsx
interface IButtonProps {
  label: string;
  onClick: () => void;
}

const Button = ({ label, onClick }: IButtonProps) => { ... };

import { Button } from 'app/components/Button';
import { useAuth } from 'app/hooks/useAuth';
import { formatDate } from './utils'; // same folder is OK
\`\`\`

### Incorrect
\`\`\`tsx
type ButtonProps = { ... };      // ❌ uses `type` and missing `I` prefix
interface ButtonPropsType { ... } // ❌ wrong pattern
interface IButton { ... }         // ❌ missing `Props` suffix

import { Button } from '../../components/Button';   // ❌ uses ../
import { useAuth } from '../../../hooks/useAuth';   // ❌ uses ../
\`\`\`