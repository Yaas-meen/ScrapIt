import { useCallback, useState } from 'react';

export function useModal(initial = false) {
  const [isOpen, setIsOpen] = useState(!!initial);
  const [data,   setData]   = useState(null);

  const open   = useCallback((payload = null) => {
    setData(payload);
    setIsOpen(true);
  }, []);

  const close  = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return { isOpen, data, open, close, toggle };
}

export default useModal;