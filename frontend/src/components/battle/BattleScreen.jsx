import { useCallback, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ROUTES, SANDBOX_STAGE_ID } from '../../config/constants';
import { getStage } from '../../data';
import { buildLineup } from '../../game/lineup';
import { createBattleScene } from '../../game/render/BattleScene';
import { useT } from '../../i18n/useT';
import NotFound from '../NotFound';
import FpsMeter from './FpsMeter';
import PixiCanvas from './PixiCanvas';

const parsePartyParam = (value) => value?.split(',').map((id) => id.trim()).filter(Boolean);

// `/battle/:stageId`. Phase 1 draws the stage's line-up without combat.
// The sandbox (`/battle/test`) also takes ?party=red,chuck,blues&wave=2 to preview heroes and waves.
export default function BattleScreen() {
  const t = useT();
  const { stageId } = useParams();
  const [searchParams] = useSearchParams();
  const stage = getStage(stageId);
  const isSandbox = stageId === SANDBOX_STAGE_ID;
  const partyParam = isSandbox ? searchParams.get('party') : null;
  const waveParam = isSandbox ? searchParams.get('wave') : null;

  const lineup = useMemo(() => {
    if (!stage) return null;
    return buildLineup(stage, {
      partyIds: parsePartyParam(partyParam),
      waveIndex: Number(waveParam ?? 1) - 1,
    });
  }, [stage, partyParam, waveParam]);

  const createScene = useCallback(({ app, world }) => createBattleScene({ app, world, lineup }), [lineup]);

  if (!lineup) return <NotFound />;

  return (
    <main className="h-dvh w-full bg-black">
      <PixiCanvas createScene={createScene}>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <Link
            to={ROUTES.HOME}
            className="pointer-events-auto rounded-md border border-white/20 bg-black/50 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-stone-100 transition hover:border-amber-400 hover:text-amber-300"
          >
            {t('common.backToMenu')}
          </Link>
          <div className="flex flex-col items-end gap-1 text-xs font-semibold uppercase tracking-widest text-white">
            <span className="rounded-md bg-black/50 px-3 py-2">
              {t('battle.wave', { current: lineup.waveIndex + 1, total: lineup.waveCount })}
            </span>
            {isSandbox && (
              <span className="rounded-md bg-amber-500/90 px-2 py-1 text-[10px] text-black">{t('battle.sandbox')}</span>
            )}
            {isSandbox && <FpsMeter />}
          </div>
        </div>
      </PixiCanvas>
    </main>
  );
}
