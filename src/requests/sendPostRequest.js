import axios from 'axios';

const sendPostRequest = async (url, data) => {
	try {
		const response = await axios.post(url, data);

		if (response.status === 201) {
			console.log('Object created successfully:', response.data);
			return response.data.url; // Assuming the API returns the new object's URL
		} else {
			console.warn('Unexpected response:', response.status);
			return null;
		}
	} catch (error) {
		console.error('Error sending request:', error);
		return null;
	}
};

export default sendPostRequest;
