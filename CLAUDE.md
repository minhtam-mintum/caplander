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

## Performance Conventions

### State colocation
- ALWAYS colocate state as close to where it is used as possible. Prefer placing `setState` inside the child component that owns the state, instead of lifting it up to the parent.
- Lifting state to a parent causes the parent and ALL its children to re-render. Keep state local to limit re-renders to only the component that needs it.
- Only lift state up when it MUST be shared between sibling components.

### Parent-to-child control via refs
- When a parent needs to control a child's internal state or trigger an action (e.g. focus, reset, scroll, imperative re-render) WITHOUT lifting that state up, use `useRef` + `forwardRef` + `useImperativeHandle` instead of passing state down through props.
- This avoids re-rendering the parent (and its subtree) just to drive a child action.

### Correct — colocated state
\`\`\`tsx
// State lives in the child → only Child re-renders on change
const Child = () => {
  const [value, setValue] = useState('');
  return <input value={value} onChange={e => setValue(e.target.value)} />;
};
\`\`\`

### Correct — parent controls child via ref
\`\`\`tsx
interface IChildHandle {
  reset: () => void;
  focus: () => void;
}

const Child = forwardRef<IChildHandle, IChildProps>((props, ref) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    reset: () => setValue(''),
    focus: () => inputRef.current?.focus(),
  }));

  return <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)} />;
});

const Parent = () => {
  const childRef = useRef<IChildHandle>(null);
  // Calling childRef.current?.reset() does NOT re-render Parent
  return (
    <>
      <Child ref={childRef} />
      <button onClick={() => childRef.current?.reset()}>Reset</button>
    </>
  );
};
\`\`\`

### Incorrect — needlessly lifted state
\`\`\`tsx
// ❌ State lifted to Parent only to control Child
// → every keystroke re-renders Parent and all its children
const Parent = () => {
  const [value, setValue] = useState('');
  return <Child value={value} onChange={setValue} />;
};
\`\`\`