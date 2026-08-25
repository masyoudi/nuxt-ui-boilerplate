import ModalConfirmation from '~/components/ModalConfirmation.vue';

export function useModalConfirmation() {
  const overlay = useOverlay();
  const modal = overlay.create(ModalConfirmation);

  return {
    ...modal
  };
}
