
import styles from  "./Modal.module.css";
import { RiCloseLine } from "react-icons/ri";

export type ModalPropsType = {
  handleClose:()=>void,
  header:string,
  body:string
}

const Modal = (props:ModalPropsType) => {
  const { handleClose,header,body } = props;

  return (
    <>
      <div className={styles.darkBG} />
      <div className={styles.centered}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h5 className={styles.heading}>{header}</h5>
          </div>
          <button className={styles.closeBtn} onPointerDown={handleClose}>
            <RiCloseLine style={{ marginBottom: "-3px" }} />
          </button>
          <div className={styles.modalContent}>
            {body}
          </div>
          <div className={styles.modalActions}>
            <div className={styles.actionsContainer}>
              <button className={styles.deleteBtn}
                onPointerDown={handleClose}
                title="Close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;