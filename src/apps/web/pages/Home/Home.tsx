import './Home.scss'
import Swiper from 'swiper/js/swiper.js';
import 'swiper/css/swiper.min.css'
import {useEffect, useRef, useState} from "react";
import CapsuleButton from "apps/web/components/CapsuleButton/CapsuleButton"
import {useDispatch} from 'react-redux'
import {queryImg} from "service/service"
import {setConfirmSearch, setDescription} from 'apps/web/store/store'
import Header from "apps/web/components/Header/Header"
import Register from "apps/web/components/Register/Register"

type imgType = {
  id: number
  width: number
  high: number
  smallUrl: string
  url: string
}

const Home = (props: any) => {
  const dispatch = useDispatch();
  const [list, setList] = useState<imgType[]>([]);

  /*lingtu 1.2============================================== start*/
  const homeRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    swiperRef.current = new Swiper(homeRef.current, {
      direction: "vertical",
      mousewheel: true,
      speed: 600,
    });
    queryImg({
      pageSize: 20,
      pageNum: 1
    }, (res: any) => {
      setList(res.data.list);
    })
    return () => {
      swiperRef.current?.destroy();
    }
  }, [])
  const tempImg = {
    page2: require("assets/images/home-pic2.png"),
    page3: require("assets/images/home-pic3.png"),
    page4: require("assets/images/home-pic4.png")
  }
  return (
    <div ref={homeRef} className={'swiper homepage'}>
      <div className="swiper-wrapper">
        {/*第1页*/}
        <section className={'swiper-slide swiper-no-swiping full-page'}>
          <Header></Header>
          <div className="search">
            <input type="text"
                   required
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       dispatch(setConfirmSearch(true));
                       dispatch(setDescription((e.target as HTMLInputElement).value));
                       props.history.push('/pictures')
                     }
                   }}
            />
            <label>
              <span className={'iconfont icon-search'}></span>
              <span>请输入</span>
            </label>
          </div>
          <div className="img-display-wrapper">
            <ul className={'img-display'}>
              {
                [...Array(5)].map((u: undefined, i) => {
                  return (
                    <li
                      key={i}
                      className={'img'}
                    >
                      {
                        [...Array(5)].map((v: undefined, j) => {
                          return (
                            <div
                              key={j}
                              className="img-box">
                              <img src={j ===4 ? list[4*i]?.url: list[4 * i + j]?.url} alt=""/>
                            </div>
                          )
                        })
                      }
                    </li>
                  )
                })
              }
            </ul>
          </div>
          <div className="bottom-bar">
            <span>了解如何使用</span>
          </div>
          <span className="swipe-down iconfont icon-down"
                onClick={() => {
                  swiperRef.current.slideTo(5);
                }}
          ></span>
        </section>
        {/*第2页*/}
        <section className={'swiper-slide swiper-no-swiping full-page'}>
          <div className="poster-wrapper">
            <div className="poster">
              <img src={tempImg.page2} alt=""/>
            </div>
          </div>
          <div className="text-wrapper">
            <div className="text">
              <h2>AI创作</h2>
              <p>你接下来想要尝试AI创作么？想想你心之所向的美图，例如，“流星划过天际的晚上，我们手拉手许下了彼此的愿望”，然后点击创作查看创作结果</p>
              <CapsuleButton className={'button'} onClick={() => {
                props.history.push('/create')
              }}
              >
                创作
              </CapsuleButton>
            </div>
          </div>
        </section>
        {/*第3页*/}
        <section className={'swiper-slide swiper-no-swiping full-page'}>
          <div className="text-wrapper">
            <div className="text">
              <h2>收藏你喜欢的
                创意图片</h2>
              <p>收集最爱，稍后查看</p>
              <CapsuleButton
                className={'button'}
                onClick={() => {
                  props.history.push('/pictures')
                }}
              >
                探索
              </CapsuleButton>
            </div>
          </div>
          <div className="poster-wrapper">
            <div className="poster">
              <div className="sub-poster">
                <img src={tempImg.page3} alt=""/>
              </div>
              <div className="sub-poster">
                <img src={tempImg.page3} alt=""/>
              </div>
              <div className="sub-poster">
                <img src={tempImg.page3} alt=""/>
              </div>
              <div className="sub-poster">
                <img src={tempImg.page3} alt=""/>
              </div>
              <div className="sub-poster">
                <img src={tempImg.page3} alt=""/>
              </div>
            </div>
          </div>
        </section>
        {/*第4页*/}
        <section className={'swiper-slide swiper-no-swiping full-page'}>
          <div className="poster-wrapper">
            <div className="poster">
              <img src={tempImg.page4} alt=""/>
            </div>
          </div>
          <div className="text-wrapper">
            <div className="text">
              <h2 style={{marginBottom: 0}}>尽情探索</h2>
              <h2 style={{whiteSpace: 'nowrap'}}>创造、尝试、实践</h2>
              <p>linkto最大的魅力在于不断发现来自全球用户的新奇事物和点子</p>
              <CapsuleButton
                className={'button'}
                onClick={() => {
                  props.history.push('/pictures')
                }}
              >
                探索
              </CapsuleButton>
            </div>
          </div>
        </section>
        {/*第5页*/}
        <section className={'swiper-slide swiper-no-swiping full-page'}>
          <div className="text-wrapper">
            <div className="text">
              <h2 style={{marginBottom: 0}}>注册</h2>
              <h2 style={{whiteSpace: 'nowrap'}}>以获取更多权限</h2>
              <p></p>
            </div>
          </div>
          <div className="poster-wrapper">
            <div className="poster">
              <Register open={true} mask={false} getContainer={false}></Register>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
export default Home