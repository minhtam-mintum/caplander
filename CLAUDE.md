## Naming Conventions

- Component props interfaces MUST be named using the pattern `I<ComponentName>Props`.
- The interface name must start with the prefix `I`, followed by the exact component name in PascalCase, followed by the suffix `Props`.
- Always use `interface` (not `type`) for component props.
- Place the interface definition directly above the component, in the same file (unless explicitly shared).

## File Structure Conventions

### types.ts — non-component interfaces and types
- All interfaces and types that live outside a component's scope MUST be extracted to a co-located `types.ts` file in the same directory.
- The component props interface (e.g. `IButtonProps`) stays in the component file, directly above the component. Everything else (domain types, shared shapes, handler signatures) goes in `types.ts`.
- Import from `./types` within the same folder.

### utils.ts — out-of-scope functions
- All pure functions defined outside a component's scope MUST be extracted to a co-located `utils.ts` file in the same directory.
- Constants used only by those functions (lookup tables, magic values) move to `utils.ts` alongside them.
- Import from `./utils` within the same folder.

### src/utils — shared utilities
- If a util function or type is reused by more than one feature/component, move it to `src/utils/` with an appropriate module name (e.g. `src/utils/time.ts`, `src/utils/html.ts`).
- Use the `app/utils/*` absolute import alias when consuming shared utils.

### Decision rule
```
used in one component folder  →  ./utils.ts  or  ./types.ts
used across multiple features →  src/utils/<module>.ts
```

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

## Styling Conventions

### Tailwind important modifiers
- ALWAYS use Tailwind CSS v4 trailing important modifier syntax: `size-9!`, `rounded-[10px]!`, `px-3!`.
- For variants, place the important modifier at the end of the utility: `hover:bg-surface-container-high!`.
- NEVER use the old leading important syntax: `!size-9`, `!rounded-[10px]`, `hover:!bg-surface-container-high`.

### Correct
\`\`\`tsx
<IconButton className='size-9! rounded-[10px]! hover:bg-surface-container-high!' />
\`\`\`

### Incorrect
\`\`\`tsx
<IconButton className='!size-9 !rounded-[10px] hover:!bg-surface-container-high' />
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

### Extract stateful hooks into isolated child components
- If a parent component calls a hook (or holds state) that is only consumed by ONE part of its JSX, extract that part into its own child component that owns the hook internally.
- A hook sitting in a parent re-renders the ENTIRE parent subtree on every state change — even siblings that don't use that state.
- This applies equally to custom hooks (`useLabels`, `useFilters`, `usePagination`, etc.) and plain `useState`/`useReducer`.

#### Incorrect — hook in parent re-renders unrelated siblings
\`\`\`tsx
// ❌ useLabels state in EventFields → label add re-renders name input,
// date pickers, time pickers, notes, and every other sibling
function EventFields() {
  const { labels, addLabel } = useLabels();
  return (
    <>
      <InputRHF name='name' />
      <SelectRHF name='label' options={buildLabelOptions(labels, addLabel)} />
      {/* ...more fields that don't use labels at all */}
    </>
  );
}
\`\`\`

#### Correct — hook lives only in the component that needs it
\`\`\`tsx
// ✅ Only LabelSelect re-renders when a label is added
function LabelSelect({ disabled }: { disabled?: boolean }) {
  const { labels, addLabel } = useLabels();
  return <SelectRHF name='label' options={buildLabelOptions(labels, addLabel)} disabled={disabled} />;
}

function EventFields() {
  return (
    <>
      <InputRHF name='name' />
      <LabelSelect />
      {/* ...siblings are unaffected by label state changes */}
    </>
  );
}
\`\`\`
