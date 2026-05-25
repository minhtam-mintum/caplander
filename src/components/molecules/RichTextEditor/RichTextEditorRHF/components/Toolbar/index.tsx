import { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $createRangeSelection,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  type NodeKey,
} from 'lexical';
import { INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode } from '@lexical/list';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $getNearestNodeOfType } from '@lexical/utils';
import { Bold, Code, Italic, Link2, List, Underline, X } from 'lucide-react';
import { InputField } from 'app/components/molecules/Inputs/InputField';
import { IconButton } from 'app/components/molecules/Buttons/IconButton';
import { ButtonField } from 'app/components/molecules/Buttons/ButtonField';
import { EDIT_LINK_COMMAND } from '../../const';

interface IToolbarProps {
  disabled?: boolean;
}

export function Toolbar({ disabled }: IToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isList, setIsList] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setIsBold(false);
          setIsItalic(false);
          setIsUnderline(false);
          setIsList(false);
          setIsLink(false);
          setIsCode(false);
          setHasSelection(false);
          return;
        }
        setHasSelection(!selection.isCollapsed());

        setIsBold(selection.hasFormat('bold'));
        setIsItalic(selection.hasFormat('italic'));
        setIsUnderline(selection.hasFormat('underline'));

        const anchorNode = selection.anchor.getNode();
        setIsList($getNearestNodeOfType(anchorNode, ListNode) !== null);
        setIsCode(selection.hasFormat('code'));

        const nodes = selection.getNodes();
        setIsLink(nodes.some((n) => $isLinkNode(n) || $isLinkNode(n.getParent())));
      });
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      EDIT_LINK_COMMAND,
      (url) => {
        setLinkUrl(url || 'https://');
        setShowLinkInput(true);
        setTimeout(() => linkInputRef.current?.focus(), 0);
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  const handleLinkButtonClick = useCallback(() => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      setShowLinkInput(false);
      setLinkUrl('');
    } else {
      setShowLinkInput(true);
      setLinkUrl('https://');
      setTimeout(() => linkInputRef.current?.focus(), 0);
    }
  }, [editor, isLink]);

  const handleLinkSubmit = useCallback(() => {
    const trimmed = linkUrl.trim();
    const url = trimmed ? (/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`) : '';

    // Find existing link node in current selection to update it directly
    let existingLinkKey: NodeKey | null = null;
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const anchorNode = selection.anchor.getNode();
      if ($isLinkNode(anchorNode)) {
        existingLinkKey = anchorNode.getKey();
      } else {
        const parent = anchorNode.getParent();
        if ($isLinkNode(parent)) existingLinkKey = parent.getKey();
      }
    });

    if (existingLinkKey && url) {
      editor.update(() => {
        const node = $getNodeByKey(existingLinkKey!);
        if ($isLinkNode(node)) node.setURL(url);
      });
    } else if (existingLinkKey && !url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }

    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const handleLinkKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLinkSubmit();
      } else if (e.key === 'Escape') {
        setShowLinkInput(false);
        setLinkUrl('');
      }
    },
    [handleLinkSubmit],
  );

  const handleListToggle = useCallback(() => {
    if (!isList) {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      return;
    }
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const anchorNode = selection.anchor.getNode();
      const anchorOffset = selection.anchor.offset;
      const listItem = $getNearestNodeOfType(anchorNode, ListItemNode);
      if (!listItem) return;
      const paragraph = $createParagraphNode();
      listItem.getChildren().forEach((child) => paragraph.append(child));
      listItem.replace(paragraph);
      if (anchorNode.getKey() === listItem.getKey()) {
        paragraph.select(0, 0);
      } else {
        const newSelection = $createRangeSelection();
        const type = $isTextNode(anchorNode) ? 'text' : 'element';
        newSelection.anchor.set(anchorNode.getKey(), anchorOffset, type);
        newSelection.focus.set(anchorNode.getKey(), anchorOffset, type);
        $setSelection(newSelection);
      }
    });
  }, [editor, isList]);

  const formatButtons = [
    {
      Icon: Bold,
      title: 'Bold',
      active: isBold,
      onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'),
    },
    {
      Icon: Italic,
      title: 'Italic',
      active: isItalic,
      onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'),
    },
    {
      Icon: Underline,
      title: 'Underline',
      active: isUnderline,
      onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline'),
    },
    {
      Icon: List,
      title: 'List',
      active: isList,
      onClick: handleListToggle,
    },
    {
      Icon: Code,
      title: 'Code',
      active: isCode,
      onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code'),
    },
    {
      Icon: Link2,
      title: 'Link',
      active: isLink,
      onClick: handleLinkButtonClick,
      extraDisabled: !isLink && !hasSelection,
    },
  ];

  return (
    <div className='border-b border-outline-variant bg-surface-container-low'>
      <div className='flex items-center gap-0.5 px-3 py-2'>
        {formatButtons.map(({ Icon, title, active, onClick, extraDisabled }) => (
          <IconButton
            key={title}
            title={title}
            disabled={disabled || extraDisabled}
            onClick={onClick}
            onMouseDown={(e) => e.preventDefault()}
            className={`p-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${active ? 'bg-primary text-white! hover:bg-primary! hover:text-white!' : ''}`}>
            <Icon size={15} />
          </IconButton>
        ))}
      </div>

      {showLinkInput && (
        <div className='flex items-center gap-1.5 px-3 pb-2'>
          <InputField
            ref={linkInputRef}
            type='url'
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={handleLinkKeyDown}
            placeholder='Paste or type a URL…'
          />
          <ButtonField
            variant='tonal'
            onClick={handleLinkSubmit}
            disabled={!/^https?:\/\/.+/.test(linkUrl.trim())}
            className='text-body-sm disabled:opacity-40 disabled:cursor-not-allowed'>
            Save
          </ButtonField>
          <IconButton
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl('');
            }}>
            <X size={14} />
          </IconButton>
        </div>
      )}
    </div>
  );
}
