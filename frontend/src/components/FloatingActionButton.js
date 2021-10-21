import { Link } from 'react-router-dom';

const FloatingActionButton = () => {
    return (
        <Link to={'/create'}>
            <button className="kc_fab_main_btn">  
                {"+"}
            </button>
        </Link>
    )

}

export default FloatingActionButton;
