import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppLoading } from 'expo';
import { useFonts } from '@use-expo/font';
import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  Layout,
  Text,
  TopNavigation,
  Icon,
  TopNavigationAction,
  IconRegistry,
  OverflowMenu,
  MenuItem,
  Modal,
  Card,
  Button,
  Input,
  Datepicker,
  List,
} from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { AsyncStorage, View } from 'react-native';

console.disableYellowBox = true;

const API_ENDPOINT = 'http://192.168.1.105:3000';

function Header({ onCreate, onJoin }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const renderMenuAction = () => (
    <TopNavigationAction
      icon={(props) => <Icon {...props} name="more-vertical" />}
      onPress={() => setMenuVisible((x) => !x)}
      style={{ marginTop: 25 }}
    />
  );

  const renderOverflowMenuAction = () => (
    <React.Fragment>
      <OverflowMenu
        anchor={renderMenuAction}
        visible={menuVisible}
        onBackdropPress={() => setMenuVisible((x) => !x)}
        style={{ marginTop: 30 }}
      >
        <MenuItem
          accessoryLeft={(props) => <Icon {...props} name="plus-outline" />}
          title="Create"
          onPress={() => {
            setMenuVisible(false);
            onCreate();
          }}
        />
        <MenuItem
          accessoryLeft={(props) => <Icon {...props} name="people-outline" />}
          title="Join"
          onPress={() => {
            setMenuVisible(false);
            onJoin();
          }}
        />
      </OverflowMenu>
    </React.Fragment>
  );

  return (
    <TopNavigation
      alignment="center"
      title={(props) => (
        <Text
          {...props}
          category="h4"
          style={{ fontFamily: 'nunito-bold', marginTop: 20 }}
        >
          KAKAPO
        </Text>
      )}
      accessoryRight={renderOverflowMenuAction}
    />
  );
}

function Create({ visible, onSubmit, onClose }) {
  const [text, setText] = useState('');
  const [freq, setFreq] = useState('');
  const [times, setTimes] = useState('');
  const [interval, setInterval] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');

  const [code, setCode] = useState(-1);

  const handleSubmit = async () => {
    const [hours, minutes] = time.split(':');
    const chantTime = new Date(date);
    chantTime.setHours(parseInt(hours, 10));
    chantTime.setMinutes(parseInt(minutes, 10));

    const data = {
      text,
      freq: parseFloat(freq),
      times: parseInt(times, 10),
      interval: parseFloat(interval),
      time: chantTime,
    };

    const res = await fetch(`${API_ENDPOINT}/chants`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const { code, message } = await res.json();
    if (res.ok) {
      console.log(code);
      setCode(code);
      onSubmit({ ...data, code });
    } else {
      console.error(message);
    }
  };

  const handleClose = () => {
    setText('');
    setFreq('');
    setTimes('');
    setInterval('');
    setDate(new Date());
    setTime('');
    setCode(-1);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onBackdropPress={handleClose}
      backdropStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <Card disabled>
        {code < 0 ? (
          <React.Fragment>
            <Text style={{ fontFamily: 'nunito-regular', marginBottom: 5 }}>
              Create a chant
            </Text>
            <Input
              placeholder="Chant text (mark syllables with dash)"
              value={text}
              onChangeText={setText}
              style={{ fontFamily: 'nunito-regular' }}
            />
            <Input
              placeholder="Words frequency in seconds"
              value={freq}
              onChangeText={setFreq}
              keyboardType="number-pad"
              style={{ fontFamily: 'nunito-regular' }}
            />
            <Input
              placeholder="How many times chant should be repeated"
              value={times}
              onChangeText={setTimes}
              keyboardType="number-pad"
              style={{ fontFamily: 'nunito-regular' }}
            />
            <Input
              placeholder="Interval between chants in seconds"
              value={interval}
              onChangeText={setInterval}
              keyboardType="number-pad"
              style={{ fontFamily: 'nunito-regular' }}
            />
            <Input
              placeholder="Time when the chant shoud begin (hh:mm)"
              value={time}
              onChangeText={setTime}
              keyboardType="numbers-and-punctuation"
              style={{ fontFamily: 'nunito-regular' }}
            />
            <Datepicker
              date={date}
              min={new Date()}
              onSelect={setDate}
              style={{ marginBottom: 10 }}
            />
            <Button
              status="success"
              onPress={handleSubmit}
              style={{ fontFamily: 'nunito-regular' }}
              size="small"
            >
              SUBMIT
            </Button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Text>Code to share with other people</Text>
            <Text
              category="h2"
              style={{
                fontFamily: 'nunito-bold',
                width: '100%',
                textAlign: 'center',
                marginBottom: 5,
              }}
            >
              {code}
            </Text>
            <Button status="success" onPress={handleClose} size="small">
              CLOSE
            </Button>
          </React.Fragment>
        )}
      </Card>
    </Modal>
  );
}

function Join({ onSubmit, visible, onClose }) {
  const [code, setCode] = useState('');

  const handleSubmit = async () => {
    const res = await fetch(`${API_ENDPOINT}/chants/${code}`);
    const data = await res.json();
    if (res.ok) {
      onClose();
      setCode('');
      onSubmit({
        ...data,
        time: new Date(data.time),
      });
    }
  };

  return (
    <Modal
      visible={visible}
      onBackdropPress={onClose}
      backdropStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      style={{ width: '80%', height: 200 }}
    >
      <Card disabled>
        <Text style={{ fontFamily: 'nunito-regular', marginBottom: 5 }}>
          Join a chant
        </Text>
        <Input
          placeholder="Chant code (6 digits)"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          textStyle={{ fontFamily: 'nunito-regular' }}
          style={{ marginBottom: 10 }}
        />
        <Button
          status="success"
          onPress={handleSubmit}
          style={{ width: 100 }}
          size="small"
        >
          SUBMIT
        </Button>
      </Card>
    </Modal>
  );
}

function ChantItem({ item, onPress }) {
  return (
    <Card onPress={() => onPress(item)}>
      <Text category="h6" style={{ fontFamily: 'nunito-bold' }}>
        {item.code}
      </Text>
      <Text style={{ fontFamily: 'nunito-regular' }}>
        {item.time.toLocaleTimeString().slice(0, 5)}
      </Text>
    </Card>
  );
}

function useTimer(end) {
  const [timeLeft, setTimeLeft] = useState(
    Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function useChantText(chant, canStart = false) {
  const [done, setDone] = useState('');
  const [remain, setRemain] = useState(chant.text);

  useEffect(() => {
    if (canStart) {
      (async () => {
        setRemain(chant.text);
        const text = chant.text.split('-');
        for (let i = 0; i < chant.times; i++) {
          let doneText = '';
          for (const [idx, part] of text.entries()) {
            if (idx > 0) {
              doneText += '-';
            }
            doneText += part;

            console.log(doneText.length);
            setDone(doneText);
            setRemain(chant.text.slice(doneText.length));
            if (idx < text.length - 1) {
              await delay(chant.freq * 1000);
            }
          }
          await delay(chant.interval * 1000);
        }
      })();
    }
  }, [canStart, chant]);

  return [done, remain];
}

const pad = (val) => (`${val}`.length < 2 ? `0${val}` : `${val}`);

function formatSeconds(time) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor(time / 60) % 60;
  const seconds = time % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function ChantInfo({ chant, visible, onClose }) {
  const timer = useTimer(chant.time);
  const [done, remain] = useChantText(chant, timer <= 0);

  return (
    <Modal
      visible={visible}
      onBackdropPress={onClose}
      style={{ width: '90%', height: 200 }}
      backdropStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <Card disabled>
        {timer > 0 ? (
          <React.Fragment>
            <Text style={{ fontFamily: 'nunito-regular', textAlign: 'center' }}>
              Time left
            </Text>
            <Text
              category="h2"
              style={{
                fontFamily: 'nunito-bold',
                width: '100%',
                textAlign: 'center',
                marginBottom: 5,
              }}
            >
              {formatSeconds(timer)}
            </Text>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Text
              style={{ width: '100%', textAlign: 'center', marginBottom: 20 }}
            >
              {done.length > 0 && (
                <Text
                  category="h1"
                  status="success"
                  style={{ fontFamily: 'nunito-bold' }}
                >
                  {done}
                </Text>
              )}
              {remain.length > 0 && (
                <Text category="h1" style={{ fontFamily: 'nunito-bold' }}>
                  {remain}
                </Text>
              )}
            </Text>
          </React.Fragment>
        )}
        <Button
          style={{ width: 100, alignSelf: 'center' }}
          status="success"
          onPress={onClose}
          size="small"
        >
          CLOSE
        </Button>
      </Card>
    </Modal>
  );
}

export default function App() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [chants, setChants] = useState([]);
  const [chantsLoaded, setChantsLoaded] = useState(false);
  const [activeChant, setActiveChant] = useState({});

  const [fontsLoaded] = useFonts({
    'nunito-light': require('./assets/fonts/Nunito-Light.ttf'),
    'nunito-regular': require('./assets/fonts/Nunito-Regular.ttf'),
    'nunito-bold': require('./assets/fonts/Nunito-Bold.ttf'),
  });

  useEffect(() => {
    AsyncStorage.getItem('chants').then((data) => {
      if (data) {
        setChants(
          JSON.parse(data).map((item) => ({
            ...item,
            time: new Date(item.time),
          }))
        );
      }
      setChantsLoaded(true);
    });
  }, []);

  if (!fontsLoaded || !chantsLoaded) {
    return <AppLoading />;
  }

  const addChant = async (item) => {
    const update = [...chants, item];
    setChants(update);
    await AsyncStorage.setItem('chants', JSON.stringify(update));
  };

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.dark}>
        <Header
          onCreate={() => setShowCreate(true)}
          onJoin={() => setShowJoin(true)}
        />
        <Layout style={{ flex: 1 }}>
          <List
            data={chants}
            keyExtractor={(item) => item.code}
            renderItem={(props) => (
              <ChantItem {...props} onPress={setActiveChant} />
            )}
          />
        </Layout>
        <StatusBar style="light" />
        <Create
          visible={showCreate}
          onSubmit={addChant}
          onClose={() => setShowCreate(false)}
        />
        <Join
          visible={showJoin}
          onSubmit={addChant}
          onClose={() => setShowJoin(false)}
        />
        {activeChant.code && (
          <ChantInfo
            visible={activeChant.code}
            onClose={() => setActiveChant({})}
            chant={activeChant}
          />
        )}
      </ApplicationProvider>
    </>
  );
}
