export const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const formatDate = (dateString) => {
    // Basic formatter if moment is not desired, but project uses moment.
    // Keeping this simple for now or wrapping moment here.
    return new Date(dateString).toLocaleDateString();
};
