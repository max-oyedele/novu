import { useEffect, useState } from 'react';

export const useBrowserTabsChannel = <T = unknown>({
  channelName,
  onMessage,
}: {
  channelName: string;
  onMessage: (args: T) => void;
}) => {
  const [tabsChannel] = useState(new BroadcastChannel(channelName));

  const postMessage = (data: T) => {
    tabsChannel.postMessage(data);
  };

  useEffect(() => {
    const listener = (event: MessageEvent<T>) => {
      onMessage(event.data);
    };

    tabsChannel.addEventListener('message', listener);

    return () => {
      tabsChannel.removeEventListener('message', listener);
    };
  }, []);

  return { postMessage };
};
