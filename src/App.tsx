import { useState,useRef, useEffect } from 'react';
import styles from './App.module.css';
import Modal from './components/modal/Modal';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { selectAuth, sendAuth, setCode } from './store/authState';
import Loader from './components/loader/Loader';
import axios from 'axios';

const App = () => {
  const [showModalLimit,setShowModalLimit] = useState(false);
  const [showModalZeroLength,setShowModalZeroLength] = useState(false);
  const [selectedFiles,setSelectedFiles] = useState<FileList|null>(null);
  const filePicker = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectAuth);
  const [filesLoading,setFilesLoading] = useState(false);
  const [filesSuccess,setFilesSuccess] = useState(false);
  const [filesError,setFilesError] = useState('');

  useEffect(() => {
    if (document.location.search.includes('code=') && document.location.search.split('=').length===2) {
      const code = document.location.search.split('=')[1];
      dispatch(setCode(code));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document.location]);

  useEffect(() => {
    if (authState.code) dispatch(sendAuth({code:authState.code}));
  }, [authState.code,dispatch]);

  const handleModal = () => {
    setShowModalLimit(false);
  }

  const handleModalZero = () => {
    setShowModalZeroLength(false);
  }

  const handleModalSuccess = () => {
    setFilesSuccess(false);
    setSelectedFiles(null);
  }

  const handleModalFileError = () => {
    setFilesError('');
  }

  const handleFileinput = (e:React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files?.length) {
      if (e.target.files?.length > 100) {
        setShowModalLimit(true);
      } else {
        setSelectedFiles(e.target.files);
      }
    }
  }

  const handleFilePick = () => {
    filePicker.current?.click();
  }

  const handleUploadFiles = async () => {
    if (!selectedFiles) {
      setShowModalZeroLength(true);
      return;
    }
    const filesArray:File[] = [];
    for (const file of selectedFiles) {
      filesArray.push(file);
    }
    setFilesLoading(true);
    await Promise.all(filesArray.map((file) => {
      return axios.get(`https://cloud-api.yandex.net/v1/disk/resources/upload?path=${file.name}&overwrite=true`,{
        headers:{
          Authorization:`OAuth ${authState.token}`
        }
      })
    })).then(response => {
      Promise.all(response.map((r,index) => {
        axios.put(r.data.href,filesArray[index])
      }))
    }).then(() => {
        setFilesLoading(false);
        setFilesSuccess(true);
      }
    ).catch(error => {
      console.error(error);
      setFilesSuccess(false);
      setFilesError(error.message);
    });
    setFilesLoading(false);
  }

  return (
    <>
      {authState.status === 'loading' && <Loader />}
      {filesLoading && <Loader />}
      {filesSuccess && <Modal handleClose={handleModalSuccess} header='Success' body='Successfully uploaded'/>}
      {filesError.length > 0 && <Modal handleClose={handleModalFileError} header='Error' body={filesError}/>}
      <div className={styles.app}>
        <h1>Test task for Softer</h1>
        {authState.isAuthenticated &&
        <div className={styles.buttonWrapper}>
          <button onPointerDown={handleFilePick}>Pick files</button>
          <input 
            className={styles.hidden} 
            ref={filePicker} 
            type="file" 
            multiple={true} 
            onChange={handleFileinput}/>
          {showModalLimit && 
            <Modal handleClose={handleModal} header='Warning' body='Exceeded limit! Max value of chosen files must not be grater than 100.'/>
          }
          {showModalZeroLength && 
            <Modal handleClose={handleModalZero} header='Warning' body='Please choose a files'/>
          }
          <button 
            onPointerDown={handleUploadFiles}>
              Upload files
          </button>
          <span>{`Chosen: ${selectedFiles===null ? 0 : selectedFiles.length} files`}</span>
        </div>
        }
        {!authState.isAuthenticated && <a href="https://oauth.yandex.ru/authorize?response_type=code&client_id=2284545861a84c8fa68d1969a25186a6">Sign in to Yandex</a>}
      </div>
    </>
  )
}

export default App;
