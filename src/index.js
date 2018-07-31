import React from 'react';
import firebase from 'firebase';
import { render } from 'react-dom';
import './style.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [{
        key: 'all',
        label: 'All',
      }],
      types: [{
        key: 'hollywood',
        label: 'Hollywood',
      }, {
        key: 'bollywood',
        label: 'Bollywood',
      }],
      isLoading: true,
      isSyncing: false,
      isHeaderActive: false,
      activeTag: null,
      activeItem: null,
      activeType: null,
      firebase: {
        apiKey: 'AIzaSyB866D787H9Vy0cEKqPZzjIalOT778FMYc',
        authDomain: 'moovyshoovy-7a59e.firebaseapp.com',
        databaseURL: 'https://moovyshoovy-7a59e.firebaseio.com',
        projectId: 'moovyshoovy-7a59e',
        storageBucket: '',
        messagingSenderId: '701918138582',
      },
      items: [
        {
          movie: 'Fight Club',
          image: require('./images/3.jpg'),
          dialogue: "It's only after we've lost everything that we're free to do anything.",
          link: 'http://www.imdb.com/title/tt0137523',
        },
      ],
    };

    this.onClickHeader = this.onClickHeader.bind(this);
    this.onClickType = this.onClickType.bind(this);
    this.onClickTag = this.onClickTag.bind(this);
    this.syncData = this.syncData.bind(this);
  }


  componentWillMount() {
    this.setUpFirebase();

    chrome.storage.local.get(['activeTag', 'activeType', 'tags', 'items'], (data) => {
      let activeTag = data.activeTag ? data.activeTag : null;
      let activeType = data.activeType ? data.activeType : null;
      let tags = data.tags ? data.tags : null;
      let items = data.items ? data.items : null;

      // if no data in storage
      if (items == null || tags == null) {
        this.hydateData();

        // load initial data
        ({ 0: activeTag } = this.state.tags);
        ({ 0: activeType } = this.state.types);
        this.setState({
          activeTag,
          activeType,
        }, () => {
          this.randomizeItem(activeTag, activeType);
        });
      } else {
        if (activeTag == null) {
          ({ 0: activeTag } = tags);
        }

        if (activeType == null) {
          ({ 0: activeType } = this.state.types);
        }

        this.setState({
          activeType,
          activeTag,
          items,
          tags,
        }, () => {
          this.randomizeItem(activeTag, activeType);
        });
      }
    });

    // hide if clicked outside
    window.addEventListener('click', () => {
      this.setState({
        isHeaderActive: false,
      });
    });
  }

  onClickHeader(event) {
    event.stopPropagation();
    this.setState({
      isHeaderActive: !this.state.isHeaderActive,
    });
  }

  onClickTag(event, clickedTag) {
    event.stopPropagation();
    chrome.storage.local.set({ activeTag: clickedTag });
    const { activeType } = this.state;

    this.setState({
      activeTag: clickedTag,
      isLoading: true,
    }, () => {
      this.randomizeItem(clickedTag, activeType);
    });
  }

  onClickType(event, clickedType) {
    event.stopPropagation();
    chrome.storage.local.set({ activeType: clickedType });
    const { activeTag } = this.state;

    this.setState({
      activeType: clickedType,
      isLoading: true,
    }, () => {
      this.randomizeItem(activeTag, clickedType);
    });
  }

  setUpFirebase() {
    const config = {
      ...this.state.firebase,
    };

    firebase.initializeApp(config);
  }

  // eslint-disable-next-line
  hydateData() {

    console.log('hydrating data');

    const dbRef = firebase.database().ref();
    dbRef.on('value', (snapshot) => {
      const firebaseData = snapshot.val();
      const { tags } = firebaseData;
      const { items } = firebaseData;
      const { 0: activeTag } = tags;

      chrome.storage.local.set({ tags, activeTag, items });

      console.log('hydration done successfully');

      this.setState({
        isSyncing: false,
      });
    });
  }

  syncData(event) {
    event.stopPropagation();
    console.log('syncing data');
    this.setState({
      isSyncing: true,
    });
    this.hydateData();
  }

  randomizeItem(activeTag, activeType) {
    let filtered = null;

    if (activeTag.key === 'all') {
      filtered = this.state.items;
    } else {
      filtered = this.state.items.filter((item) => {
        const boolean = item.tags !== undefined && item.tags.indexOf(activeTag.key) > -1;
        return boolean;
      });
    }

    filtered = filtered.filter((item) => {
      const boolean = item.type !== undefined && item.type === activeType.key;
      return boolean;
    });

    if (filtered.length === 0) {
      filtered = this.state.items;
    }

    const activeItem = filtered[Math.floor(Math.random() * filtered.length)];

    document.body.style.background = `url(${activeItem.image})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';

    // setting opacity if opacity for item is set, else set it to 0.4
    if (activeItem.opacity) {
      document.querySelector('.overlay').style.background = `rgba(0, 0, 0, ${activeItem.opacity})`;
    } else {
      document.querySelector('.overlay').style.background = 'rgba(0, 0, 0, 0)';
    }

    this.setState({
      isLoading: false,
      activeItem,
    });
  }


  render() {
    const tagItems = this.state.isLoading === false ? this.state.tags.map(tag =>
      (
        <li key={tag.key} role="presentation" onClick={e=> this.onClickTag(e, tag)} className={`tag ${this.state.activeTag.key === tag.key ? 'active' : ''}`}>{tag.label}</li>
      )) : false;

    const types = this.state.isLoading === false ? this.state.types.map(type =>
      (
        <button key={type.key} onClick={e => this.onClickType(e, type)} className={`${this.state.activeType.key === type.key ? 'active' : ''}`}>{type.label}</button>
      )) : false;

    return (
      <div className="react-root">
        <div className={`overlay ${this.state.isLoading === false ? 'active' : ''}`} />
        <div className={`content ${this.state.isLoading === false ? 'active' : ''}`}>
          <div role="presentation" onClick={this.onClickHeader} className={`header ${this.state.isHeaderActive === true ? 'active' : ''}`} id="header">
            <div className="header-content">
              <div className="type-list">{types}</div>
              <ul className="tags">{tagItems}</ul>
              <svg className={`sync ${this.state.isSyncing === true ? 'syncing' : ''}`} onClick={this.syncData} version="1.1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32">
                <path d="M27.802 5.197c-2.925-3.194-7.13-5.197-11.803-5.197-8.837 0-16 7.163-16 16h3c0-7.18 5.82-13 13-13 3.844 0 7.298 1.669 9.678 4.322l-4.678 4.678h11v-11l-4.198 4.197z" />
                <path d="M29 16c0 7.18-5.82 13-13 13-3.844 0-7.298-1.669-9.678-4.322l4.678-4.678h-11v11l4.197-4.197c2.925 3.194 7.13 5.197 11.803 5.197 8.837 0 16-7.163 16-16h-3z" />
              </svg>
            </div>
            <svg className={`reveal ${this.state.isHeaderActive === true ? 'active' : ''}`} role="presentation" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M18.7 8.3c-0.4-0.4-1-0.4-1.4 0l-5.3 5.3-5.3-5.3c-0.4-0.4-1-0.4-1.4 0s-0.4 1 0 1.4l6 6c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3l6-6c0.4-0.4 0.4-1 0-1.4z"/>
            </svg>
          </div>
          <div className={`dialogue ${this.state.isLoading === false ? 'active' : ''}`} dangerouslySetInnerHTML={{ __html: this.state.isLoading === false ? this.state.activeItem.dialogue : ''}} />

          <div className={`footer ${this.state.isLoading === false ? 'active' : ''}`}>
            <a href={this.state.isLoading === false ? this.state.activeItem.link : '/'} target="_blank">{this.state.isLoading === false ? this.state.activeItem.movie : false}</a>
          </div>
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));
