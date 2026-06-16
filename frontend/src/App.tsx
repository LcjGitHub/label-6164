import { Layout, Segmented, Typography } from 'antd';
import { useState } from 'react';

import OverviewPage from './pages/OverviewPage';
import SignListPage from './pages/SignListPage';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

type PageKey = 'list' | 'overview';

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>('list');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#001529',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <Title level={3} style={{ color: '#fff', margin: 0, lineHeight: 1.4 }}>
          老式路名牌字体图鉴
        </Title>
        <Segmented
          value={activePage}
          onChange={(value) => setActivePage(value as PageKey)}
          options={[
            { label: '列表', value: 'list' },
            { label: '概览', value: 'overview' },
          ]}
          size="middle"
        />
      </Header>
      <Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {activePage === 'list'
            ? '按城市浏览各地老式路名牌的字体风格、背景色与材质规范。'
            : '查看各城市路名牌记录数量与统一规范占比统计。'}
        </Paragraph>
        {activePage === 'list' ? <SignListPage /> : <OverviewPage />}
      </Content>
    </Layout>
  );
}
