import React, { useRef, useState } from 'react';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import SimpleMDE from 'react-simplemde-editor';

import 'easymde/dist/easymde.min.css';
import styles from './AddPost.module.scss';
import { selectIsAuth } from '../../redux/slices/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../axios';

export const AddPost = () => {
    const navigate = useNavigate();
    const isAuth = useSelector(selectIsAuth);
    const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const inputFileRef = useRef(null);

    const handleChangeFile = async (evt) => {
        try {
            const formData = new FormData();
            const file = evt.target.files[0];
            formData.append('image', file);
            const { data } = await axios.post('/upload', formData);
            setImageUrl(data.url);
        } catch (err) {
            console.log(err);
            alert('Upload error');
        }
    };

    const onClickRemoveImage = () => {
        setImageUrl('');
    };

    const onChange = React.useCallback((value) => {
        setValue(value);
    }, []);

    const options = React.useMemo(
        () => ({
            spellChecker: false,
            maxHeight: '400px',
            autofocus: true,
            placeholder: 'Введите текст...',
            status: false,
            autosave: {
                enabled: true,
                delay: 1000,
            },
        }),
        []
    );

    if (!window.localStorage.getItem('token') && !isAuth) {
        return <Navigate to="/" />;
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const fields = {
                title,
                imageUrl,
                // tags: tags.split(',').map((tag) => tag.trim()),
                tags,
                text: value,
            };
            const { data } = await axios.post('/posts', fields);
            const id = data._id;
            navigate(`/posts/${id}`);
        } catch (err) {
            console.log('Error response:', err.response?.data);
            alert('Upload error');
        }
    };

    return (
        <Paper style={{ padding: 30 }}>
            <form onSubmit={onSubmit}>
                <Button
                    onClick={() => inputFileRef.current.click()}
                    variant="outlined"
                    size="large"
                >
                    Загрузить превью
                </Button>
                <input
                    ref={inputFileRef}
                    type="file"
                    onChange={handleChangeFile}
                    hidden
                />
                {imageUrl && (
                    <>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={onClickRemoveImage}
                        >
                            Удалить
                        </Button>
                        <img
                            className={styles.image}
                            src={`http://localhost:4444${imageUrl}`}
                            alt="Uploaded"
                        />
                    </>
                )}

                <br />
                <br />
                <TextField
                    classes={{ root: styles.title }}
                    variant="standard"
                    placeholder="Заголовок статьи..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                />
                <TextField
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    classes={{ root: styles.tags }}
                    variant="standard"
                    placeholder="Тэги"
                    fullWidth
                />
                <SimpleMDE
                    className={styles.editor}
                    value={value}
                    onChange={onChange}
                    options={options}
                />
                <div className={styles.buttons}>
                    <Button type="submit" size="large" variant="contained">
                        Опубликовать
                    </Button>
                    <a href="/">
                        <Button size="large">Отмена</Button>
                    </a>
                </div>
            </form>
        </Paper>
    );
};
