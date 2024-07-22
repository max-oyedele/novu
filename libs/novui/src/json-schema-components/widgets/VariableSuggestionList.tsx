import React, { forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside, useDisclosure } from '@mantine/hooks';
import { Menu } from '@mantine/core';
import { type SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import classes from './VariableSuggestionList.styles';

export type VariableItem = {
  id: string;
  label: string;
};

export type SuggestionListRef = {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
  focus: () => void;
};

type SuggestionListProps = SuggestionProps<VariableItem>;

export const VariableSuggestionList = forwardRef<SuggestionListRef, SuggestionListProps>(
  ({ clientRect, command, query, items }, ref) => {
    const [opened, { close: closeSuggestionList, open: openSuggestionList }] = useDisclosure(true);

    // ref for closing the menu any time there's a click elsewhere.
    const clickOutRef = useClickOutside(() => {
      closeSuggestionList();
    });

    useImperativeHandle(ref, () => ({
      close: () => {
        closeSuggestionList();
      },
      focus: () => {
        openSuggestionList();
      },
      onKeyDown: ({ event }) => {
        if (event.key === 'Escape') {
          closeSuggestionList();

          return true;
        }

        return false;
      },
    }));

    const handleCommand = (id: string) => {
      const item = items.find((item) => item.id === id);
      if (!item) {
        return;
      }
      command(item);
    };

    return createPortal(
      <Menu
        opened={opened}
        closeOnEscape
        classNames={classes}
        position="bottom-start"
        width={200}
        // for some reason these don't seem to work, so we use clickOutRef on the dropdown
        closeOnClickOutside
        clickOutsideEvents={['click', 'mousedown', 'touchstart']}
      >
        <Menu.Target>
          <div
            style={{
              position: 'absolute',
              top: clientRect?.()?.bottom,
              left: clientRect?.()?.left,
            }}
          />
        </Menu.Target>

        <Menu.Dropdown ref={clickOutRef}>
          {items.map((item) => {
            return (
              <Menu.Item key={item.id} onClick={() => handleCommand(item.id)}>
                {item.label}
              </Menu.Item>
            );
          })}
        </Menu.Dropdown>
      </Menu>,
      document.body
    );
  }
);