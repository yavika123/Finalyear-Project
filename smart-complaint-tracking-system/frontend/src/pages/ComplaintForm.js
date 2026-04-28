import React, { useState } from 'react';
import styled from 'styled-components';
import axios from "axios";

const Form = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };



  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }
  
    try {
      const token = localStorage.getItem("token"); // ✅ Retrieve token from storage
      const response = await axios.post("http://localhost:5000/complaints/submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,  // ✅ Ensure the token is sent
        },
      });
  
      if (response.status === 201) {
        alert("Complaint submitted successfully!");
      } else {
        alert("Failed to submit complaint");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the complaint");
    }
  };
  

  return (
    <StyledWrapper>
      <div className="modal">
        <form className="modal__content" onSubmit={handleSubmit}>
          <div className="modal__header">
            <span className="modal__title">New project</span>
            <button className="button button--icon" type="button">
              <svg width={24} viewBox="0 0 24 24" height={24} xmlns="http://www.w3.org/2000/svg">
                <path fill="none" d="M0 0h24v24H0V0z" />
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              </svg>
            </button>
          </div>
          <div className="modal__body">
            <div className="input">
              <label className="input__label">Complaint title</label>
              <input className="input__field" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
              <p className="input__description">The title must contain a maximum of 32 characters</p>
            </div>
            <div className="input">
              <label className="input__label">Description</label>
              <textarea className="input__field input__field--textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
              <p className="input__description">Give your project a good description so everyone knows what it's for</p>
            </div>
            <div className="input">
              <label className="input__label">Upload Image</label>
              <input className="input__field" type="file" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>
          <div className="modal__footer">
            <button className="button button--primary" type="submit">Create project</button>
          </div>
        </form>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: #f8f9fa;
  padding: 20px;
  font-family: 'Roboto', sans-serif;

  .modal {
    background-color: #fff;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 15px 30px rgba(0, 125, 171, 0.15);
    border-radius: 10px;
    padding: 1rem;
  }

  .modal__header {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ddd;
  }

  .modal__body {
    padding: 1rem;
  }

  .modal__footer {
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    cursor: pointer;
  }

  .button--primary {
    background-color: #007dab;
    color: white;
    padding: 0.75rem 1.25rem;
    border-radius: 0.25rem;
    font-weight: 500;
  }

  .button--primary:hover {
    background-color: #006489;
  }

  .input {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
  }

  .input__label {
    font-weight: bold;
  }

  .input__field {
    margin-top: 0.5rem;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
  }

  .input__field:focus {
    border-color: #007dab;
    box-shadow: 0 0 0 2px rgba(0, 125, 171, 0.5);
    outline: none;
  }
`;

export default Form;
