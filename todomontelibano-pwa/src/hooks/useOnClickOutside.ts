import { useEffect, useRef, type RefObject } from 'react';

type MaybeElement = HTMLElement | null;

/**
 * Cierra un menú/dropdown al pulsar fuera de los nodos referenciados.
 * Acepta una o varias refs (p. ej. botón hamburguesa + panel portaleado).
 */
export function useOnClickOutside(
  refs: RefObject<MaybeElement> | RefObject<MaybeElement>[],
  handler: () => void,
  enabled = true,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const refsRef = useRef(refs);
  refsRef.current = refs;

  useEffect(() => {
    if (!enabled) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const list = Array.isArray(refsRef.current) ? refsRef.current : [refsRef.current];
      const clickedInside = list.some((ref) => ref.current?.contains(target));
      if (!clickedInside) handlerRef.current();
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [enabled]);
}
