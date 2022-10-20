import React from 'react';
import '../App.css';
import { useSelector ,useDispatch} from 'react-redux';
import actions from '../actions';

function Trainer(props) {
    const dispatch = useDispatch();
    const selectedTrainers = useSelector((state) => state.selected);
    const allTrainers = useSelector((state) => state.trainers);
    let targetTrainer=null;
    for(let i=0;i<allTrainers.length;i++){
     if(props.trainer.id===allTrainers[i].id)  targetTrainer = allTrainers[i];
    }
    
    const selectTrainer =()=>{
       
        dispatch(actions.changeSelected(props.trainer.id));
    }
    const deleteTrainer=()=>{
        dispatch(actions.deleteTrainer(props.trainer.id));
    }
  
    const btn_group = selectedTrainers===props.trainer.id?<button className ='addTrainerBtn' >Selected</button>:<span><button onClick={deleteTrainer} className ='addTrainerBtn' >Delete Trainer</button><button onClick={selectTrainer} className ='addTrainerBtn' >Select Trainer</button></span>;
    return (<div>
        <span className='trainer_span'>Trainer:{props.trainer.name}</span>

        {btn_group}
        <br />
        <br />
        {
        targetTrainer&&targetTrainer.pokemons.map((item,index)=>{
            return <img key ={index}className ='pokemon_img' src ={item}  alt='pokemon'></img>
        })
        }

    </div>);
}


export default Trainer;