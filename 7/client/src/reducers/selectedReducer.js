
const initalState ='';



const selectedReducer = (state = initalState, action) => {
  const { type, payload } = action;

  switch (type) {
    case 'CHANGE_SELECTED':
      console.log('payload', payload);
      return payload.id;
    default:
      return state;
  }
};

export default selectedReducer;