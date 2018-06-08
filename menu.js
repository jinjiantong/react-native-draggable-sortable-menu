import { TouchableOpacity, Animated, Dimensions, StyleSheet, View, Text, PanResponder, Platform} from 'react-native'
import React, { Component } from 'react'
import _ from 'lodash'
import * as Config from '@/constants/config'

const { width, height } = Dimensions.get("window")
const count = 3
const bWidth = 100
const bHeight = 32
const padding = (width - (bWidth * count)) / 4
const topMargin = 24
let total = 10
let context;
const MARGIN_TOP = Platform.OS === 'ios' ? Config.COMPACT.screen.navigation.height + Config.COMPACT.screen.statusbar.height + Config.COMPACT.screen.scrollableTabbarHeight :Config.COMPACT.screen.navigation.height + Config.COMPACT.screen.scrollableTabbarHeight
const unMoveIndex = 0


class menu extends Component {

  constructor(props) {
    super(props)
    context = this
    const { data, current } = this.props
    total = data.length
    this.inital()
    this.state = {
      data: data,
      styles: this.getStyles(),
      rects: this.getRects(),
      _panResponder: this.createResponder(),
      current: null,
      startDragWiggle: new Animated.Value(0)
    }

  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    this.canmove = nextProps.edit ? true : false
  }

  shake() {
    this.state.startDragWiggle.setValue(4)
    Animated.spring(this.state.startDragWiggle, {
      toValue: 0,
      velocity: 100,
      tension: 100,
      friction: 1
    }).start()

  }
  inital() {
    this.lastX = null
    this.toIndex = null
    this.current = null
    this.dStyle = null
    this.left = null
    this.top = null
    this.canmove = this.canmove ? this.canmove : false
  }

  getStyles() {
    let styles = []
    let col = 0
    for (let i = 0; i < total; i++) {
      let rect = {}
      let left
      let top
      if (0 <= i && i < 3) {
        col = i
        left = (padding * (col + 1)) + (bWidth * col)
        top = topMargin
      }
      else if (3 <= i && i < 6) {
        col = i - 3
        left = (padding * (col + 1)) + (bWidth * col)
        top = 2 * topMargin + bHeight
      }
      else if (6 <= i && i < 9) {
        col = i - 6
        left = (padding * (col + 1)) + (bWidth * col)
        top = 3 * topMargin + 2 * bHeight
      }
      else if (9 <= i && i < 12) {
        col = i - 9
        left = (padding * (col + 1)) + (bWidth * col)
        top = 4 * topMargin + 3 * bHeight
      }
      styles.push({ left: new Animated.Value(left), top: new Animated.Value(top), cIndex: i })
    }
    return styles
  }

  getRects() {
    let rects = []
    let col = 0
    for (let i = 0; i < total; i++) {
      let rect = {}
      let left
      let top
      if (0 <= i && i < 3) {
        col = i
        left = (padding * (col + 1)) + (bWidth * col)
        top = topMargin
      }
      else if (3 <= i && i < 6) {
        col = i - 3
        left = (padding * (col + 1)) + (bWidth * col)
        top = 2 * topMargin + bHeight
      }
      else if (6 <= i && i < 9) {
        col = i - 6
        left = (padding * (col + 1)) + (bWidth * col)
        top = 3 * topMargin + 2 * bHeight
      }
      else if (9 <= i && i < 12) {
        col = i - 9
        left = (padding * (col + 1)) + (bWidth * col)
        top = 4 * topMargin + 3 * bHeight
      }
      rects.push({ left: left, top: top })
    }
    return rects
  }

  createResponder() {
    return PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => this.canmove,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => { this.canmove },
      onPanResponderGrant: (evt, gestureState) => {
      
        const { rects } = this.state
        const { touches } = evt.nativeEvent;
        const left = touches[0].pageX
        const top = touches[0].pageY - MARGIN_TOP
        let index = undefined
        for (let i = 0; i < total; i++) {
          const rect = rects[i]
          if ((left >= rect.left && left <= rect.left + bWidth) && (top >= rect.top && top <= rect.top + bHeight)) {
            index = i
          }
        }

        this.current = index
       
        if (this.current === undefined || this.current === unMoveIndex) {
          this.current = undefined
          return
        }

        this.dStyle = this.state.styles[this.current]
        this.dStyle.cIndex = 999
        this.setState({ current: this.current })
    

      },
      onPanResponderMove: (evt, gestureState) => {
        if (this.current === undefined || this.current === unMoveIndex) return

        const { rects } = this.state
        const { touches } = evt.nativeEvent;
        const left = touches[0].pageX
        const top = touches[0].pageY - MARGIN_TOP

        let change = false
        this.left = this.left ? this.left : left
        this.top = this.top ? this.top : top
        this.lastX = this.lastX ? this.lastX : left

        const diffLeft = this.left - left
        const diffTop = this.top - top


        this.dStyle.left.setValue(this.dStyle.left._value - diffLeft)
        this.dStyle.top.setValue(this.dStyle.top._value - diffTop)
        const centerX = this.dStyle.left._value + (bWidth / 2)
        const centerY = this.dStyle.top._value + (bHeight / 2)

        for (let i = 0; i < total; i++) {
          let rect = rects[i]
          if ((centerX >= rect.left && centerX <= rect.left + bWidth) && (centerY >= rect.top && centerY <= rect.top + bHeight)) {
            this.toIndex = i
          }
        }



        if (!this.toIndex || this.toIndex === this.current || this.toIndex === 0) {
          this.lastX = left
          this.left = left
          this.top = top
          return
        }

        const direction = this.current - this.toIndex >= 0 ? 1 : 0

        if (direction === 0) {
          for (let i = 0; i < total; i++) {
            if (i <= this.toIndex && i > this.current) {
              let preIndex = i - 1
              let pStyle = rects[preIndex]
              let cStyle = _.find(this.state.styles, (item) => { return item.cIndex === i })
              cStyle.left.setValue(pStyle.left)
              cStyle.top.setValue(pStyle.top)
              cStyle.cIndex = preIndex
              change = true

            }
          }

        } else if (direction === 1) {
          for (let i = total; i >= 0; i--) {
            if (i < this.current && i >= this.toIndex) {
              const preIndex = i + 1
              let pStyle = rects[preIndex]
              let cStyle = _.find(this.state.styles, (item) => { return item.cIndex === i })
              cStyle.left.setValue(pStyle.left)
              cStyle.top.setValue(pStyle.top)
              cStyle.cIndex = preIndex
              change = true

            }
          }
        }

        if (change) {
          this.current = this.toIndex
        }
        this.lastX = left
        this.left = left
        this.top = top

      },

      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (this.current === undefined || this.current === unMoveIndex) return

        const { rects } = this.state
        let toIndex = null
        for (let i = 0; i < total; i++) {
          const rect = rects[i]
          if ((this.left >= rect.left && this.left <= rect.left + bWidth) && (this.top >= rect.top && this.top <= rect.top + bHeight)) {
            toIndex = i
          }
        }
        toIndex = toIndex ? toIndex : this.current
        const rect = rects[toIndex]
        if (this.dStyle) {
          this.dStyle.left.setValue(rect.left)
          this.dStyle.top.setValue(rect.top)
          this.dStyle.cIndex = toIndex
        }

        const { styles, data } = this.state
        let nStyles = this.getStyles()
        let nData = []

        //重新排序
        for (let i = 0; i < styles.length; i++) {
          styles.map((item, index) => {
            if (i === item.cIndex) {
              nData.push(data[index])
            }
          })
        }

        this.inital()

        const { callBack, current } = this.props
        let seletedIndex = 0
        nData.map((item, index) => {
          if (item.label === current) {
            seletedIndex = index
          }
        })
        this.setState({ _panResponder: this.createResponder() }, () => {
          this.setState({ data: nData, styles: nStyles, current: undefined }, () => {
            callBack(nData, seletedIndex)
          })
        })
      },
      onPanResponderTerminate: (evt, gestureState) => { },
      onShouldBlockNativeResponder: (evt, gestureState) => true,
    });
  }

  renderMenus() {
    let menus = []
    const { data } = this.state
    const { current } = this.props
    const { edit, gotoPage, active } = this.props

    data.map((item, index) => {
      const style = this.state.styles[index]

      const com = (
        <Animated.View style={{
          left: style.left,
          top: style.top,
          zIndex: this.state.current === index ? 100 : 99,
          width: bWidth, height: bHeight, position: 'absolute',
          transform: [{
            rotate: this.state.startDragWiggle.interpolate({
              inputRange: [0, 360],
              outputRange: ['0 deg', '360 deg']
            })
          }]
        }}
          index={index}
          ref={index}
          key={'animated' + index}
          {...this.state._panResponder.panHandlers}
        >
          <TouchableOpacity
            activeOpacity={1}
            key={'TouchableOpacity' + index}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 2, height: 2 },
              shadowRadius: this.state.current === index ? 2 : 0,
              shadowOpacity: this.state.current === index ? 0.2 : 0,
              borderRadius: 26, width: bWidth, height: bHeight,
              backgroundColor: unMoveIndex === index ? 'transparent' : '#efefef', 
              justifyContent: 'center', 
              borderRadius: 26
            }}
            onPress={() => {
              if (edit) {
                this.canmove = true
                return
              }
              gotoPage(index)
            }}
            onLongPress={() => {
              if (edit) return
              this.shake()
              this.canmove = true
              active(true)
            }}
          >
            <Text key={'Text' + index} style={[styles.tag, { color: current === item.label ? '#4285f4' : '#333' }]}>{item.label}</Text>
          </TouchableOpacity>
        </Animated.View>)
      menus.push(com)
    })
    return menus
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          backgroundColor:'#fff',
          opacity:0.98
        }}>
        {this.renderMenus()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  tag: {
    fontSize: 15,
    color: '#333', textAlign: 'center', backgroundColor: 'transparent'
  },

})

export default menu

