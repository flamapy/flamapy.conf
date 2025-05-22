import axios from 'axios';

const csrftoken = getCookie("csrftoken");

const axiosInstance = axios.create({
	headers: {
		"Content-Type": "application/json",
		"X-CSRFToken": csrftoken,
	},
	withCredentials: true,
});

const sendPostRequest = async (url, data) => {
	try {
		const response = await axiosInstance.post(url, data);

		if (response.status === 201) {
			console.log('Object created successfully:', response.data);
			return response.data.url;
		} else {
			console.warn('Unexpected response:', response.status);
			return null;
		}
	} catch (error) {
		console.error('Error sending request:', error);
		return null;
	}
};

function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== "") {
		const cookies = document.cookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.startsWith(name + "=")) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}


export default sendPostRequest;
