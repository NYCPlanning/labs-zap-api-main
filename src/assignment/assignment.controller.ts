import * as pgp from 'pg-promise';
import { Controller, Get, Query, Session } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { Serializer } from 'jsonapi-serializer';
import { getQueryFile } from '../_utils/get-query-file';
import { KEYS as ASSIGNMENT_KEYS } from './assignment.entity';
import { KEYS as DISPOSITION_KEYS } from '../disposition/disposition.entity';
import { KEYS as PROJECT_KEYS } from '../project/project.entity';
import { MILESTONE_KEYS } from '../project/project.entity';
import { ACTION_KEYS } from '../project/project.entity';

const userAssignmentsQuery = getQueryFile('/assignments/index.sql');
const projectQuery = getQueryFile('/projects/project.sql');

@Controller('assignments')
export class AssignmentController {
  @Get('/')
  async index(@Query() query, @Session() session) {
    const { contactid } = session;
    const { tab = 'to-review' } = query;

    // we have different queries for LUPP things
    if (tab && contactid) {
      // one of 'archive', 'reviewed', 'to-review', 'upcoming'
      if (!['archive', 'reviewed', 'to-review', 'upcoming'].includes(tab)) {
        throw new Error('Must be one of archive, reviewed, to-review, upcoming');
      }

      const SQL = pgp.as.format(userAssignmentsQuery, {
        id: contactid,
        status: tab,
      });

      const records = await getConnection().query(SQL);

      return this.serialize(records);
    }
  }

  // Serializes an array of objects into a JSON:API document
  serialize(records, opts?: object): Serializer {
    const sanitizedRecords = records.map(record => {
      if (!record.dispositions) record.dispositions = [];
      if (!record.milestones) record.milestones = [];
    });

    // This is wrong... the wrong approach.
    const AssignmentSerializer = new Serializer('assignments', {
      attributes: ASSIGNMENT_KEYS,
      project: {
        ref: 'dcp_name',
        attributes: PROJECT_KEYS,
        actions: {
          ref(project, action) {
            return `${project.dcp_name}-${action.actioncode}`;
          },
          attributes: ACTION_KEYS,
        },
        milestones: {
          ref(project, milestone) {
            return `${project.dcp_name}-${milestone.dcp_milestone}`;
          },
          attributes: MILESTONE_KEYS,
        },
        dispositions: {
          ref: 'id',
          attributes: DISPOSITION_KEYS,
        },
      },
      milestones: {
        ref(assignment, milestone) {
          return `${assignment.project.dcp_name}-${milestone.dcp_milestone}`;
        },
        attributes: MILESTONE_KEYS,
      },

      dispositions: {
        ref: 'id',
        attributes: DISPOSITION_KEYS,
      },
      meta: { ...opts },
    });

    return AssignmentSerializer.serialize(records);
  }
}
