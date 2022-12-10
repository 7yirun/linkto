import './Home.scss'
import Swiper from 'swiper/js/swiper.js';
import 'swiper/css/swiper.min.css'
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import Icons from "lib/icons"
import {getStore} from "utils/utils"
import {useSelector, useDispatch} from 'react-redux'
import {queryImg, welcome} from "service/service"
import {setShowRegister, setShowLogin, setIsLogin} from 'apps/web/store/store'
import qs from "qs";

/*const demos = [
  '一望无际的森林隐约浮现着灯塔的光芒',
  '一个巨大的外形立方体, 有奇怪的纹理,迷失在森林中',
  '傍晚,雪地里的小房子',
  '冬季印象派风景'
]*/

interface IPicture {
  name: string,
  description: string,
  url: string,
  id: number
}

const Home = (props: any) => {
  const loginState = useSelector((state: any) => state.loginState);
  const dispatch = useDispatch();
  const [imgToScale, setImgToScale] = useState('');
  const [list, setList] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const swiperRef = useRef();
  const inputRef = useRef(null);
  let [welcomeData, setWelcomeData] = useState({accountNum: 0, pictureNum: 0});
  //左侧描述词
  const [demos, setDemos] = useState([''])
  const [activeIndex, setActiveIndex] = useState(0);
  const timer = useRef<any>();
  useEffect(() => {
    if (timer.current) {
      return
    }
    timer.current = setInterval(() => {
      setActiveIndex((activeIndex) => {
        let index = activeIndex + 1;
        if (index + 4 > 20) {
          index = 0;
        }
        return index;
      })
    }, 3000)
  }, [activeIndex])
  useEffect(() => {
    queryImg({pageNum: 1, pageSize: 20}, (res: any) => {
      let list = (res.data as any).list;
      setList(list);
      console.log("list=111==",list)
      let demoText = list.map((item: any) => {
        return item.description
      });
      setDemos(demoText);
      swiperRef.current = new Swiper('.swiper-container', {
        autoplay: true,
        effect: "coverflow",
        centeredSlides: true,
        slidesPerView: "auto",
        loop: true,
        coverflowEffect: {
          rotate: 0,
          stretch: 112,
          depth: 145,
          modifier: 1,
          slideShadows: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      });
    });

    return () => {
      swiperRef.current && (swiperRef.current as any).destroy();
      clearTimeout(timer.current);
    }
  }, [])
  useEffect(() => {
    swiperRef.current && (swiperRef.current as any).update()
  }, [list]);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      welcome((res: any) => {
        setWelcomeData(res.data);
      })
      firstRender.current = false
    }
  }, [welcomeData])
  const scaleImage = (url: string) => {
    return () => {
      setImgToScale(url)
    }
  }
  const handleSearch = (e?: any) => {
    if (e.type == 'click' || e.key == 'Enter') {
      //如果没登陆就要登录
      if (!loginState.isLogin) {
        dispatch(setShowLogin(true));
      }
      //如果登录了,则跳转到创作页面 把刚才的输入进去
      else {
        let str = qs.stringify({search: searchVal})
        props.history.push('/create?' + str)
      }
    }
  }
  // @ts-ignore
  return (
    <div className={'homepage'}>
      <div className="homepage-content">
        <div className="left">
          <h4>AI艺术与创意平台</h4>
          <div className='search-area'>
            <div className="search-input-wrapper">
              <input className='search-input'
                     ref={inputRef}
                     maxLength={200}
                     onKeyUp={handleSearch}
                     value={searchVal}
                     onChange={(e) => {
                       setSearchVal(e.target.value);
                     }}
                     type="text" placeholder={'输入一句话, AI为您生成画作'}/>
              <span className='text-limit'>{`${searchVal.length}/200`}</span>
            </div>
            <p>
              <button className={'create-button'} onClick={(e) => {
                    props.history.push('/create')
                  }}
              >
                创作
              </button>
      </p>
            <p className='try'>试试下面这些句子?</p>
            {
              demos.length > 0 &&
							<ul className={'demo'}>
                {
                  //@ts-ignore
                  demos.slice(activeIndex, activeIndex + 4).map((text, index) => (
                    <li key={index}>
                      <span onClick={(e) => {
                        //@ts-ignore
                        let str = qs.stringify({search: text})
                        props.history.push('/create?' + str)
                      }}>
                        {text}
                      </span>
                    </li>
                  ))
                }
							</ul>
            }
          </div>
          {
            loginState.isLogin
            &&
            welcomeData.accountNum > 0
            &&
						<p className={'welcome-small'}>AI生成
							<strong>{welcomeData.pictureNum}</strong>
							张画作，您是第
							<strong>{welcomeData.accountNum}</strong>
							位创作者
						</p>
          }
        </div>
        <div className="right">
          <div className="swiper-container">
            <div className="swiper-wrapper">
              {
                list.map((pic: IPicture, index) => {
                  return (
                    <div key={pic.id} className="swiper-slide" onClick={scaleImage(pic.url)}>
                      {/*<div>{pic.description}</div>*/}
                      <img src={pic.url} alt=""/>
                    </div>
                  )
                })
              }
            </div>
            <div className="swiper-button-prev">
              <img src={Icons.prev} alt=""/>
            </div>
            <div className="swiper-button-next">
              <img src={Icons.next} alt=""/>
            </div>
          </div>
        </div>
        {
          imgToScale &&
					<div className="big-pic" onClick={(e) => {
            setImgToScale("");
          }}>
						<img src={imgToScale} alt=""/>
					</div>
        }
      </div>
      {
        loginState.isLogin && welcomeData.accountNum > 0 &&
				<div className="welcome">
					<p>AI生成
						<strong>{welcomeData.pictureNum}</strong>
						张画作，您是第
						<strong>{welcomeData.accountNum}</strong>
						位创作者
					</p>
				</div>
      }
    </div>
  )
}
export default Home