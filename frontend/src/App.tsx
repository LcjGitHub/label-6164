import { Layout, Typography } from 'antd';

import SignListPage from './pages/SignListPage';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

export default function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <Title level={3} style={{ color: '#fff', margin: '16px 0', lineHeight: 1.4 }}>
          老式路名牌字体图鉴
        </Title>
      </Header>
      <Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          按城市浏览各地老式路名牌的字体风格、背景色与材质规范。
        </Paragraph>
        <SignListPage />
      </Content>
    </Layout>
  );
}
