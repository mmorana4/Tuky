const subscribers = {};

const EventBus = {
    on(event, callback) {
        if (!subscribers[event]) {
            subscribers[event] = [];
        }
        subscribers[event].push(callback);

        return () => {
            this.off(event, callback);
        };
    },

    off(event, callback) {
        if (!subscribers[event]) return;
        subscribers[event] = subscribers[event].filter(cb => cb !== callback);
    },

    emit(event, data) {
        if (!subscribers[event]) return;
        subscribers[event].forEach(callback => callback(data));
    },
};

export default EventBus;
