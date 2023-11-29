import React, { useState, useEffect, useCallback } from 'react';

import api from '~/services/api';
import { Title } from '~/components/Title';
import { FightingTable } from './FightingTable';
import { DefeatedTable } from './DefeatedTable';
import { FormModal } from './FormModal';
import { Container } from './styles';

const ONE_MINUTE = 60 * 1000;

export function Dashboard() {
  const [monsters, setMonsters] = useState([]);
  const [defeated, setDefeated] = useState([]);

  const [formData, setFormData] = useState(null);

  const reList = useCallback(async (key) => {
    switch (key) {
      case 'fighting': {
        const { data } = await api.get('monsters', {
          params: {
            status: 'fighting',
          },
        });

        setMonsters(data);
        break;
      }

      case 'defeated': {
        const { data } = await api.get('monsters', {
          params: {
            status: 'defeated',
          },
        });

        setDefeated(data);
        break;
      }

      default: {
        await Promise.all([reList('fighting'), reList('defeated')]);
      }
    }
  }, []);

  const handleMonsterDefeated = useCallback(
    async ({ monsterId, heroes }) => {
      try {
        await api.put(`/monsters/${monsterId}/defeated`, { heroes });

        await reList();
        setFormData(null);
      } catch (err) {
        alert('Não foi possivel atualizar o status da ameaça!');
      }
    },
    [reList]
  );

  useEffect(() => {
    (async () => {
      await reList();
      setInterval(() => reList('fighting'), ONE_MINUTE);
    })();
  }, [reList]);

  return (
    <Container className="container">
      <Title>
        <span>H</span>erois em combate ({monsters.length})
      </Title>
      <FightingTable monsters={monsters} setFormData={setFormData} />

      <div className="pt-5 d-block" />

      <h3 className="d-flex mt-5 align-items-center">
        Combatidos
        <Badge className="ms-1" bg="primary">
          {defeated.length}
        </Badge>
      </h3>
      <hr className="mb-0" />
      <DefeatedTable monsters={defeated} />

      <FormModal
        formData={formData}
        handleMonsterDefeated={handleMonsterDefeated}
        onHide={() => setFormData(null)}
      />
    </Container>
  );
}
